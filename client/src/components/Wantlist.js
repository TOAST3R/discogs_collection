import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Wantlist.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function Wantlist({ username }) {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWantlist();
  }, [username]);

  const fetchWantlist = async (refresh = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/wantlist/${username}/all`, {
        params: refresh ? { refresh: true } : {},
      });
      setReleases(response.data.wants);
    } catch (error) {
      console.error('Failed to fetch wantlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && releases.length === 0) {
    return <div className="loading">Loading wantlist...</div>;
  }

  return (
    <div className="wantlist">
      <div className="wantlist-header">
        <h2>Wantlist</h2>
        <div className="wantlist-stats">
          <span>{releases.length} items</span>
          <button
            className="refresh-button"
            onClick={() => fetchWantlist(true)}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {releases.length === 0 ? (
        <div className="no-results">Your wantlist is empty</div>
      ) : (
        <div className="wants-grid">
          {releases.map(want => (
            <div key={want.id} className="want-card">
              <div className="want-cover">
                {want.basic_information.cover_image ? (
                  <img
                    src={want.basic_information.cover_image}
                    alt={want.basic_information.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="no-cover">💿</div>
                )}
                <div className="want-overlay">
                  <span className="want-year">{want.basic_information.year || 'N/A'}</span>
                </div>
              </div>
              <div className="want-info">
                <div className="want-artists">
                  {want.basic_information.artists?.map(artist => (
                    <span key={artist.id}>{artist.name}</span>
                  ))}
                </div>
                <h3 className="want-title">{want.basic_information.title}</h3>
                <div className="want-meta">
                  {want.basic_information.formats?.map((format, i) => (
                    <span key={i} className="format-tag">{format.name}</span>
                  ))}
                  {want.basic_information.labels?.map((label, i) => (
                    <span key={i} className="label-tag">{label.name}</span>
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

export default Wantlist;
