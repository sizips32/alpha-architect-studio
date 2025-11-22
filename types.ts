/**
 * Common type definitions shared between frontend and backend.
 * These types are derived from mcp-server/src/types.ts and must be kept in sync.
 *
 * Note: The MCP server uses Zod schemas for runtime validation.
 * This file contains the corresponding TypeScript types for the frontend.
 */

/**
 * Configuration for alpha strategy development
 * Constraints:
 * - delay: 0-10 days
 * - lookbackDays: 20-2000 days
 * - maxStockWeight: 0-10% (percentage)
 * - decay: 0-30 days
 */
export interface Config {
  universe: string; // e.g., 'TOP_3000'
  delay: number; // Days of delay (0-10)
  lookbackDays: number; // Historical data period (20-2000 days)
  maxStockWeight: number; // Max % weight per stock (0-10%)
  decay: number; // Decay period in days (0-30)
  neutralization: string; // 'none' | 'industry' | 'market'
  idea: string; // Trading idea description
  region: string; // e.g., 'US'
  performanceGoal: string; // e.g., 'High_IR'
}

/**
 * Data point for profit & loss chart
 */
export interface PnlDataPoint {
  day: number; // Day number (1-252 for one trading year)
  value: number; // Portfolio value
}

/**
 * Key Performance Indicators for backtest results
 */
export interface Kpis {
  ir: number; // Information Ratio (risk-adjusted return)
  annualReturn: number; // Annual return percentage
  maxDrawdown: number; // Maximum drawdown percentage (negative)
  turnover: number; // Daily turnover percentage
  margin: number; // Profit margin in basis points
  correlation: number; // Correlation with market benchmark
}

/**
 * Results from a backtest simulation
 */
export interface BacktestResults {
  kpis: Kpis; // Key performance indicators
  pnlData: PnlDataPoint[]; // Time series of portfolio values
}

/**
 * Historical stock price data (OHLCV)
 */
export interface HistoricalData {
  date: Date; // Trading date
  open: number; // Opening price
  high: number; // Highest price
  low: number; // Lowest price
  close: number; // Closing price
  volume: number; // Trading volume
}

/**
 * Alpha expression - a mathematical formula for stock selection
 * Examples: "rank(close, 20)", "Ts_rank(volume, 10) - rank(returns)"
 */
export type AlphaExpression = string;
