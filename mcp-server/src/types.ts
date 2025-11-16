import { z } from 'zod';

// Configuration schema
export const ConfigSchema = z.object({
    universe: z.string().default('TOP_3000'),
    delay: z.number().default(1),
    lookbackDays: z.number().default(60),
    maxStockWeight: z.number().default(2),
    decay: z.number().default(5),
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
    pnlData: z.array(z.object({
        day: z.number(),
        value: z.number(),
    })),
});

export type BacktestResults = z.infer<typeof BacktestResultsSchema>;

// Alpha expression validation schema
export const AlphaExpressionSchema = z.string().min(1, "Alpha expression cannot be empty");

export type AlphaExpression = z.infer<typeof AlphaExpressionSchema>;
