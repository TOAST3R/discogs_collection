import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import Collection from './components/Collection';
import Wantlist from './components/Wantlist';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [username, setUsername] = useState(localStorage.getItem('discogsUsername') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (username) {
      fetchStats();
    }
  }, [username]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats/${username}`);
      setStats(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setIsAuthenticated(false);
    }
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('discogsUsername', username);
    fetchStats();
  };

  const handleLogout = () => {
    localStorage.removeItem('discogsUsername');
    setUsername('');
    setStats(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h1>Discogs Collection Visualizer</h1>
        <form onSubmit={handleUsernameSubmit} className="login-form">
          <input
            type="text"
            placeholder="Enter your Discogs username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="username-input"
          />
          <button type="submit" className="login-button">Connect</button>
        </form>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>Discogs Collection Visualizer</h1>
          <div className="header-nav">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/collection" className="nav-link">Collection</Link>
            <Link to="/wantlist" className="nav-link">Wantlist</Link>
            <span className="user-info">{username}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard stats={stats} username={username} />} />
            <Route path="/collection" element={<Collection username={username} onRefreshed={fetchStats} />} />
            <Route path="/wantlist" element={<Wantlist username={username} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
