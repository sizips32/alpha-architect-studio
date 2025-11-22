import { z } from 'zod';

/**
 * Shared type definitions used across the application (frontend and backend).
 * Using Zod schemas for runtime validation and type inference.
 */

// Configuration schema with defaults
export const ConfigSchema = z.object({
  universe: z.string().default('TOP_3000'),
  delay: z.number().int().min(0).max(10).default(1),
  lookbackDays: z.number().int().min(20).max(2000).default(60),
  maxStockWeight: z.number().min(0).max(1).default(0.02),
  decay: z.number().min(0).max(1).default(0.5),
  neutralization: z.enum(['none', 'industry', 'market', 'Market']).default('Market'),
  idea: z.string().default('Momentum'),
  region: z.string().default('US'),
  performanceGoal: z.string().default('High_IR'),
});

export type Config = z.infer<typeof ConfigSchema>;

// Historical data schema
export const HistoricalDataSchema = z.object({
  date: z.date(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export type HistoricalData = z.infer<typeof HistoricalDataSchema>;

// PnL data point schema
export const PnlDataPointSchema = z.object({
  day: z.number(),
  value: z.number(),
});

export type PnlDataPoint = z.infer<typeof PnlDataPointSchema>;

// KPI schema
export const KpisSchema = z.object({
  ir: z.number(),
  annualReturn: z.number(),
  maxDrawdown: z.number(),
  turnover: z.number(),
  margin: z.number(),
  correlation: z.number(),
});

export type Kpis = z.infer<typeof KpisSchema>;

// Backtest results schema
export const BacktestResultsSchema = z.object({
  kpis: KpisSchema,
  pnlData: z.array(PnlDataPointSchema),
});

export type BacktestResults = z.infer<typeof BacktestResultsSchema>;

// Alpha expression validation schema
export const AlphaExpressionSchema = z.string().min(1, 'Alpha expression cannot be empty');

export type AlphaExpression = z.infer<typeof AlphaExpressionSchema>;
