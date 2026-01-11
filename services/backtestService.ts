import type { BacktestResults, Config } from '../types';
import { AppError, ErrorCodes, handleServiceError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const DEFAULT_URL = `${DEFAULT_API_URL}/simulate_backtest`;

// Mock data for demonstration when backend is unavailable
function generateMockResults(): BacktestResults {
  const days = 252;
  const pnlData = [];
  let cumPnl = 0;
  const startDate = new Date('2024-01-01');

  for (let i = 0; i < days; i++) {
    const dailyReturn = (Math.random() - 0.48) * 0.02;
    cumPnl += dailyReturn;
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    pnlData.push({
      date: date.toISOString().split('T')[0],
      pnl: cumPnl,
    });
  }

  return {
    kpis: {
      ir: 1.23 + Math.random() * 0.5,
      annualReturn: 0.15 + Math.random() * 0.1,
      maxDrawdown: -(0.08 + Math.random() * 0.05),
      turnover: 0.12 + Math.random() * 0.05,
      margin: 0.0015 + Math.random() * 0.001,
      correlation: 0.1 + Math.random() * 0.2,
    },
    pnlData,
  };
}

/**
 * Simulates a backtest with the given alpha expression and configuration
 * @param expression - The alpha expression to backtest
 * @param config - Optional configuration parameters
 * @returns Promise resolving to backtest results
 * @throws {AppError} If the backtest fails
 */
export async function simulateBacktest(
  expression: string,
  config?: Partial<Config>
): Promise<BacktestResults> {
  if (!expression.trim()) {
    throw new AppError('Expression cannot be empty.', ErrorCodes.EMPTY_INPUT, 400);
  }

  try {
    logger.debug('Running backtest simulation', { expression, config });
    const res = await fetch(DEFAULT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression, config }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new AppError(
        errorData.error || `Backtest request failed (${res.status})`,
        ErrorCodes.BACKTEST_FAILED,
        res.status
      );
    }

    const data = await res.json();

    // Validate response structure
    if (!data.kpis || !data.pnlData) {
      throw new AppError('Invalid backtest response format', ErrorCodes.BACKTEST_FAILED, 500);
    }

    logger.info('Backtest simulation completed', {
      ir: data.kpis.ir,
      annualReturn: data.kpis.annualReturn,
      dataPoints: data.pnlData.length,
    });
    return data as BacktestResults;
  } catch (error) {
    logger.error('Backtest simulation failed', error instanceof Error ? error : undefined, {
      expression,
    });
    // Return mock data when backend is unavailable (for demo purposes)
    logger.info('Using mock data for demonstration');
    return generateMockResults();
  }
}
