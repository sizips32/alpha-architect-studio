/**
 * Common type definitions shared between frontend and backend.
 * These types should match the MCP server types for consistency.
 */

export interface Config {
  universe: string;
  delay: number;
  lookbackDays: number;
  maxStockWeight: number;
  decay: number;
  neutralization: string;
  idea: string;
  region: string;
  performanceGoal: string;
}

export interface PnlDataPoint {
  day: number;
  value: number;
}

export interface Kpis {
  ir: number;
  annualReturn: number;
  maxDrawdown: number;
  turnover: number;
  margin: number;
  correlation: number;
}

export interface BacktestResults {
  kpis: Kpis;
  pnlData: PnlDataPoint[];
}

export interface HistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Alpha expression type - a string representing a mathematical expression
 */
export type AlphaExpression = string;
