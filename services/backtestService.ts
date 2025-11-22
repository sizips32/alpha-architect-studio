import type { BacktestResults, Config } from '../types';
import { AppError, ErrorCodes, handleServiceError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

const DEFAULT_API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8787';
const DEFAULT_URL = `${DEFAULT_API_URL}/simulate_backtest`;

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
    throw handleServiceError(error);
  }
}
