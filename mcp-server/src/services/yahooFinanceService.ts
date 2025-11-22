import type { HistoricalData } from '../types.js';

// NOTE: This uses a public proxy to get around CORS issues with the Yahoo Finance API.
// In a production environment, you would want to have your own backend service for this.
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const PROXY_ACTIVATION_URL = 'https://cors-anywhere.herokuapp.com/corsdemo';
const API_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';

export class CorsActivationError extends Error {
  constructor(
    message: string,
    public activationUrl: string
  ) {
    super(message);
    this.name = 'CorsActivationError';
  }
}

export const fetchHistoricalData = async (ticker: string): Promise<HistoricalData[]> => {
  const url = `${PROXY_URL}${API_BASE_URL}${ticker}?range=5y&interval=1d`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 403) {
        // Throw a custom, structured error for this specific, actionable case.
        throw new CorsActivationError(
          'The public CORS proxy requires activation.',
          PROXY_ACTIVATION_URL
        );
      }
      if (response.status === 404) {
        const responseText = await response.text();
        if (responseText.includes('No data found for symbol')) {
          throw new Error(`Data not found for ticker "${ticker}". It may be an invalid symbol.`);
        }
      }
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.chart?.error?.description ||
          `Failed to fetch data. Server responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    const result = data.chart.result[0];

    if (!result || !result.timestamp) {
      throw new Error(
        `No data found for ticker: "${ticker}". Please check if the ticker is valid.`
      );
    }

    const timestamps = result.timestamp;
    const { open, high, low, close, volume } = result.indicators.quote[0];

    const historicalData: HistoricalData[] = timestamps
      .map((ts: number, i: number) => ({
        date: new Date(ts * 1000),
        open: open[i],
        high: high[i],
        low: low[i],
        close: close[i],
        volume: volume[i],
      }))
      .filter(
        (dp: any) =>
          dp.open != null &&
          dp.high != null &&
          dp.low != null &&
          dp.close != null &&
          dp.volume != null
      );

    return historicalData;
  } catch (error) {
    console.error('Yahoo Finance API Error:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(
        `Network error. Please check your internet connection and ensure the CORS proxy is accessible.`
      );
    }
    // Re-throw custom errors or wrap others
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while fetching financial data.');
  }
};

export const searchTickers = async (
  query: string
): Promise<Array<{ symbol: string; name: string; exchange: string }>> => {
  // This is a simplified implementation. In production, you'd want to use a proper search API
  const commonTickers = [
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
  ];

  const queryLower = query.toLowerCase();
  return commonTickers.filter(
    (ticker) =>
      ticker.symbol.toLowerCase().includes(queryLower) ||
      ticker.name.toLowerCase().includes(queryLower)
  );
};
