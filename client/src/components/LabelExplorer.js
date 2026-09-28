import React, { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { sortEntries, timelineData, timelineOptions, yearSeries } from './chart-config';
import RankedBars from './RankedBars';
import './LabelExplorer.css';

const DISCOGS_RELEASE_URL = 'https://www.discogs.com/release';

const hasCatno = (release) => release.catno && release.catno !== 'none';

// Pick a label on the left, see what it contributes to the collection on the right
function LabelExplorer({ labels, labelDetails, total }) {
  const [selected, setSelected] = useState(labels[0]?.[0] || null);

  const detail = selected ? labelDetails[selected] : null;
  const count = labels.find(([name]) => name === selected)?.[1] || 0;

  const years = useMemo(() => yearSeries(detail?.years), [detail]);

  const releases = useMemo(() => {
    if (!detail) {
      return [];
    }
    return [...detail.releases].sort((a, b) => (a.year || 9999) - (b.year || 9999));
  }, [detail]);

  if (labels.length === 0) {
    return null;
  }

  return (
    <section className="panel label-explorer">
      <div className="panel-header">
        <h3>Labels</h3>
        <span className="panel-meta">{labels.length} labels</span>
      </div>

      <div className="label-explorer-body">
        <div className="label-list">
          <RankedBars
            entries={labels}
            total={total}
            limit={15}
            onSelect={setSelected}
            selected={selected}
          />
        </div>

        {selected && (
          <div className="label-detail">
            <div className="label-detail-header">
              <div>
                <h4>{selected}</h4>
                <div className="label-detail-meta">
                  {count} release{count === 1 ? '' : 's'}
                  {detail && ` · ${Object.keys(detail.artists).length} artists`}
                  {years.labels.length > 0 &&
                    ` · ${years.labels[0]}–${years.labels[years.labels.length - 1]}`}
                </div>
              </div>
              <Link
                className="label-open"
                to={`/collection?label=${encodeURIComponent(selected)}`}
              >
                Open in collection →
              </Link>
            </div>

            {detail ? (
              <>
                <div className="label-detail-grid">
                  <div>
                    <h5>Styles</h5>
                    <RankedBars entries={sortEntries(detail.styles)} total={count} limit={6} />
                  </div>
                  <div>
                    <h5>Artists</h5>
                    <RankedBars entries={sortEntries(detail.artists)} limit={6} />
                  </div>
                </div>

                {years.labels.length > 1 && (
                  <div>
                    <h5>Release years</h5>
                    <div className="label-years-chart">
                      <Bar data={timelineData(years)} options={timelineOptions()} />
                    </div>
                  </div>
                )}

                <div>
                  <h5>Releases</h5>
                  <ul className="label-releases">
                    {releases.map(release => (
                      <li key={release.instanceId}>
                        <a
                          href={`${DISCOGS_RELEASE_URL}/${release.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${release.artist} – ${release.title}`}
                        >
                          {release.thumb ? (
                            <img src={release.thumb} alt="" loading="lazy" />
                          ) : (
                            <span className="label-release-placeholder" />
                          )}
                          <span className="label-release-text">
                            <span className="label-release-title">{release.title}</span>
                            <span className="label-release-sub">
                              {release.artist}
                              {release.year ? ` · ${release.year}` : ''}
                              {hasCatno(release) ? ` · ${release.catno}` : ''}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className="label-no-detail">
                No breakdown for this label yet. Open it in the collection to browse its releases.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default LabelExplorer;
