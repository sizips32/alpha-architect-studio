# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alpha Architect Studio is a **quantitative trading strategy development platform** that allows users to:

- Design and test alpha (trading) strategies using mathematical expressions
- Run backtests with configurable parameters
- View performance metrics (KPIs) and visualizations
- Export results to PDF and Excel
- Use AI (Gemini) to generate alpha expressions from natural language descriptions

The application is built with **React + TypeScript** frontend and a **Node.js HTTP server** backend.

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for bundling and development
- **Recharts** for interactive dashboard charts
- **Tailwind CSS** (via CDN) for styling
- Lazy loading with `React.Suspense` for code splitting

### Backend (mcp-server/)

- **Node.js** with TypeScript
- **yahoo-finance2** for real-time market data
- **@google/genai** for Gemini AI integration
- **MCP SDK** for Model Context Protocol support
- **Express-style HTTP server** (custom implementation)

## Project Structure

```
alpha-architect-studio/
├── App.tsx                 # Main application component
├── index.tsx               # React entry point
├── types.ts                # Shared TypeScript types
├── constants.ts            # Default config and tooltips
├── errors.ts               # Custom error types
├── components/
│   ├── Header.tsx          # App header
│   ├── Footer.tsx          # App footer
│   ├── ConfigPanel.tsx     # Strategy configuration form
│   ├── ExpressionEditor.tsx # Alpha expression input + AI assist
│   ├── ResultsDashboard.tsx # KPIs and charts display
│   ├── PerformanceChart.tsx # PnL line chart (Recharts)
│   ├── MarketTicker.tsx    # Real-time stock ticker widget
│   ├── KpiCard.tsx         # Individual KPI display card
│   ├── KRGuideExpander.tsx # Korean language guide
│   ├── ParameterSlider.tsx # Config slider component
│   ├── InfoTooltip.tsx     # Tooltip component
│   └── CorsActivationNotice.tsx
├── services/
│   ├── backtestService.ts  # Backtest API calls
│   ├── geminiService.ts    # AI expression generation
│   ├── yahooFinanceService.ts # Stock data fetching
│   └── marketDataService.ts # Market data utilities
├── utils/
│   ├── pdfExport.ts        # Browser-native PDF export (SVG charts)
│   ├── excelExport.ts      # Excel XML export
│   ├── errorHandler.ts     # Error handling utilities
│   └── logger.ts           # Logging utilities
└── mcp-server/
    └── src/
        ├── httpServer.ts   # Main HTTP API server
        ├── index.ts        # MCP server entry
        └── types.ts        # Backend types
```

## Common Commands

### Development

```bash
npm run dev          # Frontend dev server (port 3555)
npm run dev:server   # Backend HTTP server only (port 8787)
npm run dev:all      # Frontend + backend concurrently
npm run build        # Frontend production build
npm run build:server # Backend build (TypeScript compile)
```

### Testing

```bash
npm test                    # Run all tests (Vitest)
npm test -- --run           # Run once without watch mode
npm test -- path/to/file    # Run specific test file
npm run test:coverage       # Run with coverage report
npm run test:ui             # Vitest with browser UI
```

### Code Quality

```bash
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run format       # Prettier format
npm run format:check # Check formatting only
```

### Backend Server (from mcp-server/)

```bash
cd mcp-server
npm run dev:http    # Development with hot reload
npm run start:http  # Production
```

## Key APIs

### Backend Endpoints (localhost:3555)

| Endpoint                   | Method | Description                      |
| -------------------------- | ------ | -------------------------------- |
| `/api/backtest`            | POST   | Run backtest simulation          |
| `/api/generate-expression` | POST   | Generate alpha expression via AI |
| `/api/market-data`         | GET    | Get real-time stock prices       |
| `/api/health`              | GET    | Health check                     |

### Request/Response Types

```typescript
// Backtest request
interface BacktestRequest {
  expression: string; // Alpha formula like "Ts_rank(close, 10)"
  config: Config;
}

// Backtest response
interface BacktestResults {
  kpis: Kpis; // IR, annual return, max drawdown, etc.
  pnlData: PnlDataPoint[];
  benchmark?: BenchmarkData;
  trades?: Trade[]; // Individual trade history
}
```

## Architecture Notes

### State Management

- React's built-in `useState` and `useCallback` hooks
- No external state management library
- Config state lives in `App.tsx` and is passed down

### Error Handling

- Custom `AppError` class with error codes
- `getUserFriendlyMessage()` for user-facing messages
- Errors displayed in Korean

### Internationalization

- UI is primarily in **Korean** (한글)
- Korean text for buttons, labels, KPIs, tooltips
- PDF/Excel exports use Korean headers

### PDF/Excel Export

- **No external libraries** - uses browser-native APIs
- PDF: `window.print()` with custom CSS
- Excel: XML SpreadsheetML format
- Charts rendered as inline SVG (not Recharts)

## Important Patterns

### Lazy Loading

Heavy components are lazy-loaded:

```typescript
const ConfigPanel = lazy(() => import('./components/ConfigPanel'));
```

### Memoization

KPI values and callbacks are memoized:

```typescript
const kpiValues = useMemo(() => ({ ... }), [kpis]);
const handleExport = useCallback(() => { ... }, [deps]);
```

### CORS Handling

The backend includes CORS headers for local development:

```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
```

## Environment Variables

Frontend connects to backend at `http://localhost:8787` by default (configurable via `VITE_API_URL`).

For the backend server, create `mcp-server/.env`:

```
GEMINI_API_KEY=your_gemini_api_key
```

## Common Issues & Solutions

### CORS Errors

If you see CORS errors, ensure the backend server is running on port 8787.

### Yahoo Finance Rate Limiting

The market data service may hit rate limits. The ticker widget has built-in retry logic.

### PDF Export Not Working

PDF export uses `window.print()` - ensure pop-ups are allowed in the browser.

### React Hooks Rules

All hooks must be called before any early returns in components. See `ResultsDashboard.tsx` for the correct pattern when using `useMemo` with conditional rendering.

## Code Style Guidelines

- Use TypeScript strict mode patterns
- Prefer functional components with hooks
- Use `useCallback` for handlers passed as props
- Use `useMemo` for expensive computations
- Korean comments and user-facing text
- JSDoc comments for exported functions
- Tailwind CSS for styling (no CSS modules)

## Testing

Tests use Vitest with React Testing Library. Mock browser APIs as needed:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock ResizeObserver for recharts components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

Test files are in `tests/` directory mirroring the source structure.

## Git Workflow

- Main branch: `main`
- Feature branches should be descriptive
- Commit messages can be in Korean or English
- Run `npm run lint` before committing
