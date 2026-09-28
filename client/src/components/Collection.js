import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './Collection.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const DISCOGS_RELEASE_URL = 'https://www.discogs.com/release';
const ALL_LABELS = 'All';

function Collection({ username, onRefreshed }) {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedLabel, setSelectedLabel] = useState(ALL_LABELS);
  const [sortBy, setSortBy] = useState('added');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCollection();
  }, [username]);

  const fetchCollection = async (refresh = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/collection/${username}/all`, {
        params: refresh ? { refresh: true } : {},
      });
      setReleases(response.data.releases);
      setTotalItems(response.data.total);
      if (refresh && onRefreshed) {
        onRefreshed();
      }
    } catch (error) {
      console.error('Failed to fetch collection:', error);
    } finally {
      setLoading(false);
    }
  };

  // Unique label names across the collection, most-owned first, for the label filter
  const labels = useMemo(() => {
    const counts = {};
    releases.forEach(release => {
      const names = new Set(release.basic_information.labels?.map(l => l.name));
      names.forEach(name => {
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort(([nameA, countA], [nameB, countB]) => countB - countA || nameA.localeCompare(nameB))
      .map(([name, count]) => ({ name, count }));
  }, [releases]);

  const filteredReleases = releases.filter(release => {
    const basicInfo = release.basic_information;
    const matchesFormat = selectedFormat === 'All' || 
      basicInfo.formats?.some(f => f.name === selectedFormat);
    const matchesLabel = selectedLabel === ALL_LABELS ||
      basicInfo.labels?.some(l => l.name === selectedLabel);
    const matchesSearch = searchQuery === '' || 
      basicInfo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      basicInfo.artists?.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFormat && matchesLabel && matchesSearch;
  });

  const sortedReleases = [...filteredReleases].sort((a, b) => {
    if (sortBy === 'artist') {
      return a.basic_information.artists[0].name.localeCompare(b.basic_information.artists[0].name);
    } else if (sortBy === 'title') {
      return a.basic_information.title.localeCompare(b.basic_information.title);
    } else if (sortBy === 'year') {
      return (b.basic_information.year || 0) - (a.basic_information.year || 0);
    }
    return 0;
  });

  const formats = ['All', 'Vinyl', 'CD', 'Cassette', 'Digital'];

  if (loading && releases.length === 0) {
    return <div className="loading">Loading collection...</div>;
  }

  return (
    <div className="collection">
      <div className="collection-header">
        <h2>Collection</h2>
        <div className="collection-stats">
          <span>{totalItems} releases</span>
          <button
            className="refresh-button"
            onClick={() => fetchCollection(true)}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="collection-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search artists or titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <label>Format:</label>
          <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}>
            {formats.map(format => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>

        <div className="filter-box">
          <label>Label:</label>
          <select value={selectedLabel} onChange={(e) => setSelectedLabel(e.target.value)}>
            <option value={ALL_LABELS}>All</option>
            {labels.map(({ name, count }) => (
              <option key={name} value={name}>{name} ({count})</option>
            ))}
          </select>
        </div>

        <div className="sort-box">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="added">Added</option>
            <option value="artist">Artist</option>
            <option value="title">Title</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {sortedReleases.length === 0 ? (
        <div className="no-results">No releases found</div>
      ) : (
        <div className="releases-grid">
          {sortedReleases.map(release => (
            <div key={release.instance_id} className="release-card">
              <a
                className="release-cover"
                href={`${DISCOGS_RELEASE_URL}/${release.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {release.basic_information.cover_image ? (
                  <img
                    src={release.basic_information.cover_image}
                    alt={release.basic_information.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="no-cover">💿</div>
                )}
                <div className="release-overlay">
                  <span className="release-year">{release.basic_information.year || 'N/A'}</span>
                </div>
              </a>
              <div className="release-info">
                <div className="release-artists">
                  {release.basic_information.artists?.map(artist => (
                    <span key={artist.id}>{artist.name}</span>
                  ))}
                </div>
                <h3 className="release-title">
                  <a
                    href={`${DISCOGS_RELEASE_URL}/${release.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {release.basic_information.title}
                  </a>
                </h3>
                {release.basic_information.labels?.length > 0 && (
                  <div className="release-labels">
                    {release.basic_information.labels.map((label, i) => (
                      <div key={i} className="release-label">
                        <button
                          type="button"
                          className="release-label-name"
                          onClick={() => setSelectedLabel(label.name)}
                          title={`Show only ${label.name}`}
                        >
                          {label.name}
                        </button>
                        {label.catno && label.catno !== 'none' && (
                          <span className="release-catno">{label.catno}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="release-meta">
                  {release.basic_information.formats?.map((format, i) => (
                    <span key={i} className="format-tag">{format.name}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Collection;
