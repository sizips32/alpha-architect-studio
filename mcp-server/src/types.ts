import { z } from 'zod';

// Configuration schema with validation
export const ConfigSchema = z.object({
  universe: z.string().default('TOP_3000'),
  delay: z.number().int().min(0).max(10).default(1), // Days of delay (0-10)
  lookbackDays: z.number().int().min(20).max(2000).default(60), // Historical data period (20-2000 days)
  maxStockWeight: z.number().min(0).max(10).default(2), // Max % weight per stock (0-10%)
  decay: z.number().int().min(0).max(30).default(5), // Decay period in days (0-30)
  neutralization: z.string().default('Market'),
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
  pnlData: z.array(
    z.object({
      day: z.number(),
      value: z.number(),
    })
  ),
});

export type BacktestResults = z.infer<typeof BacktestResultsSchema>;

// Alpha expression validation schema
export const AlphaExpressionSchema = z.string().min(1, 'Alpha expression cannot be empty');

export type AlphaExpression = z.infer<typeof AlphaExpressionSchema>;
