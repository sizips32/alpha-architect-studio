import type { HistoricalData } from '../types.js';
import { YAHOO_FINANCE, COMMON_TICKERS } from '../../../shared/constants.js';

// NOTE: This uses a public proxy to get around CORS issues with the Yahoo Finance API.
// In a production environment, you would want to have your own backend service for this.
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const PROXY_ACTIVATION_URL = YAHOO_FINANCE.PROXY_ACTIVATION_URL;
const API_BASE_URL = YAHOO_FINANCE.API_BASE_URL;

export class CorsActivationError extends Error {
    constructor(message: string, public activationUrl: string) {
        super(message);
        this.name = 'CorsActivationError';
    }
}

export const fetchHistoricalData = async (ticker: string): Promise<HistoricalData[]> => {
    const url = `${PROXY_URL}${API_BASE_URL}${ticker}?range=${YAHOO_FINANCE.DEFAULT_RANGE}&interval=${YAHOO_FINANCE.DEFAULT_INTERVAL}`;

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
        })).filter((dp: HistoricalData) =>
            dp.open != null && dp.high != null && dp.low != null && dp.close != null && dp.volume != null
        );

        return historicalData;

    } catch (error) {
        console.error("Yahoo Finance API Error:", error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error(`Network error. Please check your internet connection and ensure the CORS proxy is accessible.`);
        }
        // Re-throw custom errors or wrap others
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown error occurred while fetching financial data.');
    }
};

export const searchTickers = async (query: string): Promise<Array<{ symbol: string, name: string, exchange: string }>> => {
    // This is a simplified implementation. In production, you'd want to use a proper search API
    const queryLower = query.toLowerCase();
    return COMMON_TICKERS.filter(ticker =>
        ticker.symbol.toLowerCase().includes(queryLower) ||
        ticker.name.toLowerCase().includes(queryLower)
    );
};
