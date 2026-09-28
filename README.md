# Discogs Collection Visualizer

A modern web application to visualize and explore your Discogs music collection with beautiful charts and interactive interfaces.

## Features

- **Dashboard** with interactive visualizations:
  - Genre distribution pie chart
  - Format breakdown bar chart
  - Timeline by decade line chart
  - Top artists and labels lists
- **Collection Browser** with:
  - Album grid with cover art
  - Search and filter by format
  - Sort by artist, title, year, or added date
  - Pagination support
- **Wantlist Viewer** with similar grid display
- Beautiful dark theme with smooth animations
- Responsive design for all screen sizes

## Setup

### Prerequisites

- Node.js (v14 or higher)
- Discogs API credentials (Consumer Key, Consumer Secret)

### Get Discogs API Credentials

1. Go to [Discogs Developers](https://www.discogs.com/developers/)
2. Click "Create an app"
3. Fill in the form and get your Consumer Key and Secret

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd discogs-collection
```

2. Install dependencies:
```bash
npm install
cd client && npm install && cd ..
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` and add your Discogs credentials:
```
DISCOGS_CONSUMER_KEY=your_consumer_key_here
DISCOGS_CONSUMER_SECRET=your_consumer_secret_here
```

4. Run in development mode:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

### Usage

1. Open your browser to `http://localhost:3000`
2. Enter your Discogs username
3. Your collection will load and display
4. Navigate between Dashboard, Collection, and Wantlist

## Project Structure

```
discogs-collection/
├── server/
│   └── index.js              # Express backend with Discogs API
├── client/
│   ├── public/
│   │   └── index.html        # HTML template
│   └── src/
│       ├── components/
│       │   ├── Dashboard.js  # Stats visualizations
│       │   ├── Collection.js # Collection grid
│       │   └── Wantlist.js   # Wantlist grid
│       ├── App.js            # Main React app
│       ├── App.css           # Global styles
│       └── index.js          # React entry point
├── package.json              # Root dependencies
└── .env.example              # Environment template
```

## API Endpoints

- `GET /api/identity` - Get authenticated user info
- `GET /api/collection/:username` - Get user's collection
- `GET /api/wantlist/:username` - Get user's wantlist
- `GET /api/stats/:username` - Get collection statistics
- `GET /api/release/:id` - Get release details

## Technologies

- **Backend**: Node.js, Express
- **Frontend**: React, React Router
- **API Client**: disconnect (Discogs API wrapper)
- **Visualizations**: Chart.js, react-chartjs-2
- **Styling**: CSS3 with custom properties

## Development

- `npm run dev` - Start both backend and frontend in development mode (hot-reloading):
    - Backend runs at http://localhost:3001 (restarts automatically on code changes)
    - Frontend runs at http://localhost:3000 (auto-reloads browser on code changes)
    - Use this for a smooth workflow: open one terminal, run `npm run dev`, and both servers run together!
- `npm run server` - Start only the backend (auto-reloads)
- `npm run client` - Start only the frontend (with React dev server)
- `npm run build` - Build React for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
