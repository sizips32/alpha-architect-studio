/**
 * Shared constants used across the application.
 * Note: Environment-specific values should still use environment variables.
 */

/**
 * Yahoo Finance API configuration
 */
export const YAHOO_FINANCE = {
  API_BASE_URL: 'https://query1.finance.yahoo.com/v8/finance/chart/',
  PROXY_ACTIVATION_URL: 'https://cors-anywhere.herokuapp.com/corsdemo',
  DEFAULT_RANGE: '5y',
  DEFAULT_INTERVAL: '1d',
} as const;

/**
 * Default ticker symbols for search
 */
export const COMMON_TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ' },
] as const;

/**
 * Valid alpha expression functions
 */
export const VALID_ALPHA_FUNCTIONS = [
  'rank',
  'delay',
  'correlation',
  'delta',
  'Ts_rank',
  'sma',
  'stddev',
] as const;

/**
 * Valid data fields for alpha expressions
 */
export const VALID_ALPHA_FIELDS = [
  'open',
  'high',
  'low',
  'close',
  'volume',
  'returns',
  'cap',
  'revenue',
  'ebitda',
  'debt',
] as const;
