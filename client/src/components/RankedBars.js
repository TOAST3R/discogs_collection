import React, { useState } from 'react';
import './RankedBars.css';

// Horizontal ranked bars in plain HTML: long names stay readable and rows can be clickable
function RankedBars({ entries, total, limit = 10, onSelect, selected }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, limit);
  const max = entries.length > 0 ? entries[0][1] : 0;

  if (entries.length === 0) {
    return <div className="ranked-empty">No data</div>;
  }

  return (
    <div className="ranked-bars">
      <ol>
        {visible.map(([name, count]) => {
          const share = total ? Math.round((count / total) * 100) : null;
          const row = (
            <>
              <span className="ranked-name">{name}</span>
              <span className="ranked-track">
                <span className="ranked-fill" style={{ width: `${(count / max) * 100}%` }} />
              </span>
              <span className="ranked-value">
                {count}
                {share !== null && <span className="ranked-share">{share}%</span>}
              </span>
            </>
          );
          const tooltip = `${name}: ${count} release${count === 1 ? '' : 's'}` +
            (share !== null ? ` (${share}% of collection)` : '');
          return (
            <li key={name}>
              {onSelect ? (
                <button
                  type="button"
                  className={`ranked-row clickable${selected === name ? ' selected' : ''}`}
                  onClick={() => onSelect(name)}
                  title={tooltip}
                >
                  {row}
                </button>
              ) : (
                <div className="ranked-row" title={tooltip}>{row}</div>
              )}
            </li>
          );
        })}
      </ol>
      {entries.length > limit && (
        <button type="button" className="ranked-more" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : `Show all ${entries.length}`}
        </button>
      )}
    </div>
  );
}

export default RankedBars;
