import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

// Chart.js draws on canvas, so theme values can't come from CSS variables
const SERIES_COLOR = '#3987e5';
const SERIES_HOVER = '#6da7ec';
const TICK_COLOR = '#9a988f';
const GRID_COLOR = 'rgba(255, 255, 255, 0.06)';

export const sortEntries = (obj = {}) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

export function timelineOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 26, 0.95)',
        titleColor: '#f5f5f5',
        bodyColor: '#c3c2b7',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => {
            const count = ctx.parsed.y || 0;
            return `${count} release${count === 1 ? '' : 's'}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: TICK_COLOR, maxRotation: 0, autoSkipPadding: 12 },
        grid: { display: false },
        border: { color: 'rgba(255, 255, 255, 0.15)' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: TICK_COLOR, precision: 0 },
        grid: { color: GRID_COLOR },
        border: { display: false },
      },
    },
  };
}

export function timelineData({ labels, values }) {
  return {
    labels,
    datasets: [
      {
        // null instead of 0 so empty years don't draw a rounded sliver
        data: values.map(value => value || null),
        backgroundColor: SERIES_COLOR,
        hoverBackgroundColor: SERIES_HOVER,
        borderRadius: { topLeft: 4, topRight: 4 },
        borderSkipped: 'bottom',
        maxBarThickness: 28,
      },
    ],
  };
}

export // Every year between the oldest and newest release, so gaps show as empty slots
function yearSeries(years = {}) {
  const known = Object.keys(years).map(Number).filter(year => year > 0);
  if (known.length === 0) {
    return { labels: [], values: [] };
  }
  const labels = [];
  const values = [];
  for (let year = Math.min(...known); year <= Math.max(...known); year++) {
    labels.push(String(year));
    values.push(years[year] || 0);
  }
  return { labels, values };
}
