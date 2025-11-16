import type { HistoricalData } from '../types';
import { CorsActivationError } from '../errors';
import { AppError, ErrorCodes, handleServiceError } from '../utils/errorHandler';

// NOTE: This uses a public proxy to get around CORS issues with the Yahoo Finance API.
// In a production environment, you would want to have your own backend service for this.
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const PROXY_ACTIVATION_URL = 'https://cors-anywhere.herokuapp.com/corsdemo';
const API_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';

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
             if (responseText.includes("No data found for symbol")) {
                throw new Error(`Data not found for ticker "${ticker}". It may be an invalid symbol.`);
             }
        }
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.chart?.error?.description || `Failed to fetch data. Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart.result[0];

    if (!result || !result.timestamp) {
      throw new Error(`No data found for ticker: "${ticker}". Please check if the ticker is valid.`);
    }

    const timestamps = result.timestamp;
    const { open, high, low, close, volume } = result.indicators.quote[0];

    const historicalData: HistoricalData[] = timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000),
      open: open[i],
      high: high[i],
      low: low[i],
      close: close[i],
      volume: volume[i],
    })).filter(dp => 
        dp.open != null && dp.high != null && dp.low != null && dp.close != null && dp.volume != null
    );

    return historicalData;

  } catch (error) {
    console.error("Yahoo Finance API Error:", error);
    
    // Re-throw custom errors
    if (error instanceof CorsActivationError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new AppError(
        'Network error. Please check your internet connection and ensure the CORS proxy is accessible.',
        ErrorCodes.NETWORK_ERROR,
        503
      );
    }
    
    // Handle other errors
    throw handleServiceError(error);
  }
};
