import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Collection.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function Collection({ username, onRefreshed }) {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState('All');
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

  const filteredReleases = releases.filter(release => {
    const basicInfo = release.basic_information;
    const matchesFormat = selectedFormat === 'All' || 
      basicInfo.formats?.some(f => f.name === selectedFormat);
    const matchesSearch = searchQuery === '' || 
      basicInfo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      basicInfo.artists?.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFormat && matchesSearch;
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
              <div className="release-cover">
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
              </div>
              <div className="release-info">
                <div className="release-artists">
                  {release.basic_information.artists?.map(artist => (
                    <span key={artist.id}>{artist.name}</span>
                  ))}
                </div>
                <h3 className="release-title">{release.basic_information.title}</h3>
                <div className="release-meta">
                  {release.basic_information.formats?.map((format, i) => (
                    <span key={i} className="format-tag">{format.name}</span>
                  ))}
                  {release.basic_information.labels?.map((label, i) => (
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

export default Collection;
