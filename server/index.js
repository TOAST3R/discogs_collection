// TLS verification is disabled only for local dev (e.g. behind an intercepting proxy)
if (!process.env.VERCEL) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
const express = require('express');
const cors = require('cors');
const { Client } = require('disconnect');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('client/build'));

const discogs = new Client({
  consumerKey: process.env.DISCOGS_CONSUMER_KEY,
  consumerSecret: process.env.DISCOGS_CONSUMER_SECRET
});

// Cache full-list fetches for a day per user; persisted to disk so it survives restarts
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
// Vercel's filesystem is read-only apart from /tmp, which lives only as long as the instance
const CACHE_FILE = process.env.VERCEL
  ? '/tmp/discogs-cache.json'
  : path.join(__dirname, '../.cache/discogs-cache.json');
const cache = new Map();

function loadCacheFromDisk() {
  try {
    const saved = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    Object.entries(saved).forEach(([key, { data, fetchedAt }]) => {
      if (Date.now() - fetchedAt < CACHE_TTL_MS) {
        cache.set(key, { promise: Promise.resolve(data), data, fetchedAt });
      }
    });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to load cache file, starting empty:', error.message);
    }
  }
}

// Saves are chained so concurrent fetches never race on the temp file or write out of order
let saveQueue = Promise.resolve();

function saveCacheToDisk() {
  saveQueue = saveQueue.then(writeCacheFile);
  return saveQueue;
}

async function writeCacheFile() {
  const snapshot = {};
  cache.forEach(({ data, fetchedAt }, key) => {
    if (data !== undefined) {
      snapshot[key] = { data, fetchedAt };
    }
  });
  try {
    await fs.promises.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    // Write then rename so a crash mid-write never leaves a corrupt cache file
    await fs.promises.writeFile(`${CACHE_FILE}.tmp`, JSON.stringify(snapshot));
    await fs.promises.rename(`${CACHE_FILE}.tmp`, CACHE_FILE);
  } catch (error) {
    console.error('Failed to save cache file:', error.message);
  }
}

loadCacheFromDisk();

// Stores the promise so concurrent requests share one in-flight fetch; failures aren't cached.
// refresh=true skips any cached entry and refetches from Discogs.
function cached(key, fetcher, refresh = false) {
  const hit = cache.get(key);
  if (!refresh && hit && Date.now() - hit.fetchedAt < CACHE_TTL_MS) {
    return hit.promise;
  }
  const entry = { fetchedAt: Date.now() };
  entry.promise = fetcher()
    .then((data) => {
      entry.data = data;
      saveCacheToDisk();
      return data;
    })
    .catch((error) => {
      if (cache.get(key) === entry) {
        cache.delete(key);
      }
      throw error;
    });
  cache.set(key, entry);
  return entry.promise;
}

// Discogs caps per_page at 100, so walk every page and concatenate the items
async function fetchAllPages(fetchPage, itemsKey) {
  const first = await fetchPage(1);
  const items = [...first[itemsKey]];
  for (let page = 2; page <= first.pagination.pages; page++) {
    const next = await fetchPage(page);
    items.push(...next[itemsKey]);
  }
  return items;
}

function getAllCollectionReleases(username, refresh) {
  return cached(`collection:${username.toLowerCase()}`, () => fetchAllPages(
    page => discogs.user().collection().getReleases(username, 0, { page, per_page: 100 }),
    'releases',
  ), refresh);
}

function getAllWants(username, refresh) {
  return cached(`wantlist:${username.toLowerCase()}`, () => fetchAllPages(
    page => discogs.user().wantlist().getReleases(username, { page, per_page: 100 }),
    'wants',
  ), refresh);
}

app.get('/api/identity', async (req, res) => {
  try {
    const identity = await discogs.getIdentity();
    res.json(identity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/collection/:username/all', async (req, res) => {
  const { username } = req.params;

  try {
    const releases = await getAllCollectionReleases(username, req.query.refresh === 'true');
    res.json({ releases, total: releases.length });
  } catch (error) {
    console.error('Failed to fetch full collection:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/collection/:username', async (req, res) => {
  const { username } = req.params;
  const { page = 1, per_page = 50 } = req.query;
  
  try {
    const collection = discogs.user().collection();
    const releases = await collection.getReleases(username, 0, { page, per_page });
    res.json(releases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wantlist/:username/all', async (req, res) => {
  const { username } = req.params;

  try {
    const wants = await getAllWants(username, req.query.refresh === 'true');
    res.json({ wants, total: wants.length });
  } catch (error) {
    console.error('Failed to fetch full wantlist:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wantlist/:username', async (req, res) => {
  const { username } = req.params;
  const { page = 1, per_page = 50 } = req.query;
  
  try {
    const wantlist = discogs.user().wantlist();
    const releases = await wantlist.getReleases(username, { page, per_page });
    res.json(releases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const TOP_LABEL_DETAILS = 40;

function increment(counts, key) {
  counts[key] = (counts[key] || 0) + 1;
}

// Distinct names only, so a release listing the same label/artist twice counts once
function uniqueNames(items) {
  return [...new Set((items || []).map(item => item.name).filter(Boolean))];
}

function buildStats(releases) {
  const stats = {
    total: releases.length,
    genres: {},
    styles: {},
    formats: {},
    decades: {},
    years: {},
    artists: {},
    labels: {},
    labelDetails: {},
  };
  const byLabel = {};

  releases.forEach(release => {
    const info = release.basic_information;

    new Set(info.formats?.map(format => format.name || 'Unknown')).forEach(name => {
      increment(stats.formats, name);
    });
    new Set(info.genres).forEach(genre => increment(stats.genres, genre));
    new Set(info.styles).forEach(style => increment(stats.styles, style));
    uniqueNames(info.artists).forEach(name => increment(stats.artists, name));

    if (info.year) {
      increment(stats.years, info.year);
      increment(stats.decades, `${Math.floor(info.year / 10) * 10}s`);
    }

    uniqueNames(info.labels).forEach(name => {
      increment(stats.labels, name);
      (byLabel[name] = byLabel[name] || []).push(release);
    });
  });

  // Detailed breakdowns only for the biggest labels to keep the payload small
  Object.entries(stats.labels)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_LABEL_DETAILS)
    .forEach(([name]) => {
      const detail = { styles: {}, formats: {}, artists: {}, years: {}, releases: [] };
      byLabel[name].forEach(release => {
        const info = release.basic_information;
        new Set(info.styles?.length ? info.styles : info.genres).forEach(style => {
          increment(detail.styles, style);
        });
        new Set(info.formats?.map(format => format.name || 'Unknown')).forEach(format => {
          increment(detail.formats, format);
        });
        uniqueNames(info.artists).forEach(artist => increment(detail.artists, artist));
        if (info.year) {
          increment(detail.years, info.year);
        }
        detail.releases.push({
          id: release.id,
          instanceId: release.instance_id,
          title: info.title,
          artist: uniqueNames(info.artists).join(', '),
          year: info.year || null,
          catno: info.labels?.find(label => label.name === name)?.catno || null,
          thumb: info.thumb || null,
        });
      });
      stats.labelDetails[name] = detail;
    });

  return stats;
}

app.get('/api/stats/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const releases = await getAllCollectionReleases(username, req.query.refresh === 'true');
    res.json(buildStats(releases));
  } catch (error) {
    console.error('Failed to build stats:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/release/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const release = await discogs.database().getRelease(id);
    res.json(release);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Imported as a serverless handler on Vercel (api/index.js); listens when run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
