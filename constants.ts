import type { Config } from './types';

/**
 * Default configuration for alpha strategy development
 * Used as initial state when the app loads
 */
export const defaultConfig: Config = {
  universe: 'TOP_3000',
  delay: 1,
  lookbackDays: 60,
  maxStockWeight: 2,
  decay: 5,
  neutralization: 'Market',
  idea: 'Momentum',
  region: 'US',
  performanceGoal: 'High_IR',
};

/**
 * Tooltip definitions for configuration parameters and KPIs
 * Maps parameter names to their explanatory tooltip text
 */
export const tooltips: { [key: string]: string } = {
  universe: 'The set of stocks the alpha will trade, e.g., the top 3000 most liquid stocks.',
  delay:
    'Data availability (0-10 days). Delay-1 uses previous day prices to decide trades for the current day.',
  lookbackDays: 'The period of historical data used to compute the alpha signal (20-2000 days).',
  maxStockWeight:
    'Maximum % weight allocated to a single stock (0-10%) to limit idiosyncratic risk. Default is 2%.',
  decay:
    'Days over which to apply linear decay to alpha values (0-30 days), smoothing the signal and reducing turnover. Default is 5 days.',
  neutralization:
    'Method to remove systematic risk. Market-neutral removes market beta, Industry-neutral removes industry-specific risks.',
  // FIX: Add missing tooltips for Key Performance Indicators (KPIs).
  ir: 'Information Ratio. Measures risk-adjusted return. A higher value is better. IR > 1 is considered good.',
  annualReturn:
    'The geometric average amount of money earned by an investment each year over a given time period.',
  maxDrawdown:
    'The maximum observed loss from a peak to a trough of a portfolio, before a new peak is attained.',
  turnover:
    'The percentage of a portfolio that is sold daily. High turnover can result in higher transaction costs.',
  margin:
    'The profit margin on trades, measured in basis points (1bp = 0.01%). Higher margin indicates more profitable trades.',
  correlation:
    'Measures the statistical relationship between your alpha and a benchmark (e.g., market). A low correlation is desirable for diversification.',
};
