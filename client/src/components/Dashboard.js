import React, { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { sortEntries, timelineData, timelineOptions, yearSeries } from './chart-config';
import LabelExplorer from './LabelExplorer';
import RankedBars from './RankedBars';
import './Dashboard.css';

function Dashboard({ stats }) {
  const [timelineMode, setTimelineMode] = useState('years');

  const styles = useMemo(() => sortEntries(stats.styles), [stats]);
  const genres = useMemo(() => sortEntries(stats.genres), [stats]);
  const formats = useMemo(() => sortEntries(stats.formats), [stats]);
  const artists = useMemo(() => sortEntries(stats.artists), [stats]);
  const labels = useMemo(() => sortEntries(stats.labels), [stats]);

  const years = useMemo(() => yearSeries(stats.years), [stats]);
  const decades = useMemo(() => {
    const keys = Object.keys(stats.decades || {}).sort();
    return { labels: keys, values: keys.map(key => stats.decades[key]) };
  }, [stats]);

  const yearSpan = years.labels.length > 0
    ? `${years.labels[0]}–${years.labels[years.labels.length - 1]}`
    : '—';
  const busiestYear = years.values.length > 0
    ? years.labels[years.values.indexOf(Math.max(...years.values))]
    : null;

  const kpis = [
    { label: 'Releases', value: stats.total },
    { label: 'Artists', value: artists.length },
    { label: 'Labels', value: labels.length },
    { label: 'Years', value: yearSpan, note: busiestYear && `peak ${busiestYear}` },
  ];

  const timeline = timelineMode === 'years' ? years : decades;

  return (
    <div className="dashboard">
      <section className="kpi-row">
        {kpis.map(({ label, value, note }) => (
          <div key={label} className="kpi">
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
            {note && <div className="kpi-note">{note}</div>}
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Release years</h3>
          <div className="segmented" role="group" aria-label="Timeline granularity">
            {['years', 'decades'].map(mode => (
              <button
                key={mode}
                type="button"
                className={timelineMode === mode ? 'active' : ''}
                onClick={() => setTimelineMode(mode)}
              >
                {mode === 'years' ? 'Year' : 'Decade'}
              </button>
            ))}
          </div>
        </div>
        <div className="timeline-chart">
          <Bar data={timelineData(timeline)} options={timelineOptions()} />
        </div>
      </section>

      <LabelExplorer
        labels={labels}
        labelDetails={stats.labelDetails || {}}
        total={stats.total}
      />

      <section className="panel-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Styles</h3>
            <span className="panel-meta">{styles.length} styles</span>
          </div>
          <RankedBars entries={styles} total={stats.total} limit={12} />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Top artists</h3>
            <span className="panel-meta">{artists.length} artists</span>
          </div>
          <RankedBars entries={artists} total={stats.total} limit={12} />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Genres</h3>
          </div>
          <RankedBars entries={genres} total={stats.total} limit={8} />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Formats</h3>
          </div>
          <RankedBars entries={formats} total={stats.total} limit={8} />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
