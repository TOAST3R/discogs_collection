# AGENTS.md - Guide for AI Coding Agents

This file contains essential information for agentic coding agents working on this repository.

## Build/Test/Lint Commands

### Development
- `npm run dev` - Start both Express backend (hot reload with nodemon) and React frontend in development mode, with one command.
    - Backend (Express, auto-restarts on changes) runs at http://localhost:3001
    - Frontend (React dev server) runs at http://localhost:3000
    - Ideal for both human and agentic developers: use this command to ensure the full stack is running before taking action, testing, or developing. (AGENTS: always use this before code changes or tests that need both services.)
- `npm run server` - Start Express backend only (with nodemon for hot reload)
- `npm run client` - Start React frontend only (with Create React App dev server)

#### How to run the complete development setup
1. In the project root, run:

        npm run dev

2. This will automatically start:
    - Backend (Express API, port 3001, auto-reloads on server code changes)
    - Frontend (React UI, port 3000, auto-reloads on frontend code changes)

3. You can visit http://localhost:3000 to use the app in your browser. Any code changes to backend or frontend will be reflected automatically.

4. To stop, use Ctrl+C in the terminal running the process.

### Build & Production
- `npm run build` - Build React app for production (creates client/build/)
- `npm start` - Run production Express server (serves React build)

### Testing & Quality
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint on all JS/JSX files
- `npm run lint:fix` - Auto-fix ESLint issues

### Running Single Test
```bash
npm test -- --testNamePattern="test_name"
```

## Code Style Guidelines

### File Structure
- Backend: `server/index.js` - Main Express server
- Frontend: `client/src/components/` - React components
- Each major component has its own CSS file

### Imports
- Use ES6 import syntax (never require)
- Group imports: external libraries, internal modules, styles
- Sort imports alphabetically within groups
- Example:
```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Component.css';
```

### Formatting
- 2 spaces indentation (no tabs)
- Max line length: 100 characters
- Use semicolons
- Single quotes for strings
- Trailing commas in multi-line objects/arrays

### Types
- Project uses JavaScript (not TypeScript)
- Use PropTypes for component prop validation if needed
- Handle null/undefined checks explicitly

### Naming Conventions
- **Components**: PascalCase (`Dashboard`, `Collection`)
- **Functions/Variables**: camelCase (`fetchCollection`, `releases`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE`, `PORT`)
- **CSS Classes**: kebab-case (`release-card`, `collection-header`)
- **File Names**: PascalCase for components (`Dashboard.js`), kebab-case for utilities

### Error Handling
- Use try/catch with async/await
- Log errors with context
- Show user-friendly error messages in UI
- Example:
```javascript
try {
  const response = await axios.get(`${API_BASE}/collection/${username}`);
  setReleases(response.data.releases);
} catch (error) {
  console.error('Failed to fetch collection:', error);
  setError('Unable to load collection. Please try again.');
}
```

### React Best Practices
- Use functional components with hooks
- Destructure props: `function Component({ prop1, prop2 })`
- Use `useEffect` for side effects and data fetching
- Keep components focused and single-purpose
- Use memoization for expensive operations (`useMemo`, `useCallback`)
- Always clean up effects: return cleanup function

### CSS Guidelines
- Use CSS custom properties (variables) for theme colors
- Main variables defined in `:root` in App.css
- Use flexbox and CSS Grid for layouts
- Implement responsive design with media queries
- Add hover states and transitions for interactive elements
- Never use !important

### API Integration
- Use axios for HTTP requests
- Base URL: `process.env.REACT_APP_API_URL || 'http://localhost:3001/api'`
- Always handle loading states
- Implement pagination with page/per_page params
- Cache responses when appropriate

### Environment Variables
- Never commit `.env` file
- Use `.env.example` as template
- Variables are prefixed appropriately:
  - Server: `DISCOGS_*`
  - Client: `REACT_APP_*`

### Git Commit Conventions
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Keep messages concise (50 chars or less for subject line)
- Explain why in body, not what

## Common Patterns

### Async Data Fetching
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(url);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [url]);
```

### List Rendering with Keys
```javascript
{items.map(item => (
  <Component key={item.id} {...item} />
))}
```

### Conditional Rendering
```javascript
{loading ? <div>Loading...</div> : <Component data={data} />}
{error && <div className="error">{error}</div>}
```

## Cursor/Copilot Rules Integration

None present in this repository yet. Add any AI-specific rules to `.cursor/rules/` or `.github/copilot-instructions.md` and reference them here.
