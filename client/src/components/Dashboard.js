import React from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard({ stats, username }) {
  const getTopEntries = (obj, count = 10) => {
    return Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count);
  };

  const genresData = {
    labels: getTopEntries(stats.genres, 8).map(e => e[0]),
    datasets: [
      {
        data: getTopEntries(stats.genres, 8).map(e => e[1]),
        backgroundColor: [
          '#e94560',
          '#4ecdc4',
          '#ffe66d',
          '#ff6b6b',
          '#4ecdc4',
          '#95e1d3',
          '#f38181',
          '#aa96da'
        ],
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2
      }
    ]
  };

  const formatsData = {
    labels: getTopEntries(stats.formats, 6).map(e => e[0]),
    datasets: [
      {
        label: 'Count',
        data: getTopEntries(stats.formats, 6).map(e => e[1]),
        backgroundColor: [
          'rgba(233, 69, 96, 0.8)',
          'rgba(78, 205, 196, 0.8)',
          'rgba(255, 230, 109, 0.8)',
          'rgba(255, 107, 107, 0.8)',
          'rgba(170, 150, 218, 0.8)',
          'rgba(149, 225, 211, 0.8)'
        ],
        borderRadius: 8
      }
    ]
  };

  const decadesData = {
    labels: Object.keys(stats.decades).sort(),
    datasets: [
      {
        label: 'Releases',
        data: Object.keys(stats.decades).sort().map(k => stats.decades[k]),
        borderColor: '#4ecdc4',
        backgroundColor: 'rgba(78, 205, 196, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#e94560',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#f5f5f5',
          font: { size: 12, family: 'Segoe UI' },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 26, 0.95)',
        titleColor: '#e94560',
        bodyColor: '#f5f5f5',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        ticks: { color: '#f5f5f5' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y: {
        ticks: { color: '#f5f5f5' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#f5f5f5',
          font: { size: 12 },
          padding: 15
        }
      }
    }
  };

  const topArtists = getTopEntries(stats.artists, 10);
  const topLabels = getTopEntries(stats.labels, 10);

  return (
    <div className="dashboard">
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">💿</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Releases</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎵</div>
          <div className="stat-info">
            <div className="stat-value">{Object.keys(stats.genres).length}</div>
            <div className="stat-label">Genres</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎤</div>
          <div className="stat-info">
            <div className="stat-value">{Object.keys(stats.artists).length}</div>
            <div className="stat-label">Artists</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <div className="stat-value">{Object.keys(stats.labels).length}</div>
            <div className="stat-label">Labels</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Genres Distribution</h3>
          <div className="chart-container">
            <Pie data={genresData} options={pieOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Formats</h3>
          <div className="chart-container">
            <Bar data={formatsData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>Timeline by Decade</h3>
          <div className="chart-container">
            <Line data={decadesData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="top-lists">
        <div className="top-list">
          <h3>Top Artists</h3>
          <ul>
            {topArtists.map(([artist, count], i) => (
              <li key={artist}>
                <span className="rank">#{i + 1}</span>
                <span className="name">{artist}</span>
                <span className="count">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="top-list">
          <h3>Top Labels</h3>
          <ul>
            {topLabels.map(([label, count], i) => (
              <li key={label}>
                <span className="rank">#{i + 1}</span>
                <span className="name">{label}</span>
                <span className="count">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
