import { describe, it, expect, vi, beforeEach } from 'vitest';
import { simulateBacktest } from '../../services/backtestService';
import { AppError, ErrorCodes } from '../../utils/errorHandler';

// Mock fetch
global.fetch = vi.fn();

// Mock logger to suppress output during tests
vi.mock('../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('backtestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('simulateBacktest', () => {
    const mockConfig = {
      universe: 'TOP_3000',
      delay: 1,
      lookbackDays: 60,
      maxStockWeight: 0.02,
      decay: 0.5,
      neutralization: 'market',
      region: 'US',
    };

    const mockSuccessResponse = {
      kpis: {
        ir: 1.5,
        annualReturn: 0.25,
        maxDrawdown: -0.1,
        turnover: 0.15,
        margin: 0.002,
        correlation: 0.15,
      },
      pnlData: [
        { day: 1, value: 1000 },
        { day: 2, value: 1010 },
        { day: 3, value: 1025 },
      ],
      benchmark: {
        name: 'S&P 500',
        data: [
          { day: 1, value: 1000 },
          { day: 2, value: 1005 },
          { day: 3, value: 1008 },
        ],
        return: 0.008,
      },
      trades: [
        {
          date: '2024-01-01',
          symbol: 'AAPL',
          name: 'Apple Inc.',
          sector: 'Technology',
          action: 'BUY',
          quantity: 100,
          price: 150,
          amount: 15000,
        },
      ],
    };

    it('should throw error for empty expression', async () => {
      await expect(simulateBacktest('')).rejects.toThrow(AppError);
      await expect(simulateBacktest('   ')).rejects.toThrow(AppError);
    });

    it('should throw error with correct code for empty expression', async () => {
      try {
        await simulateBacktest('');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCodes.EMPTY_INPUT);
        expect((error as AppError).statusCode).toBe(400);
      }
    });

    it('should return backtest results on success', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const result = await simulateBacktest('rank(close, 20)', mockConfig);

      expect(result).toEqual(mockSuccessResponse);
      expect(result.kpis.ir).toBe(1.5);
      expect(result.pnlData).toHaveLength(3);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/simulate_backtest'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should send expression and config in request body', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const expression = 'Ts_rank(close, 10)';
      await simulateBacktest(expression, mockConfig);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.expression).toBe(expression);
      expect(requestBody.config).toEqual(mockConfig);
    });

    it('should return mock data on API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      });

      // The service falls back to mock data instead of throwing
      const result = await simulateBacktest('rank(close, 20)', mockConfig);

      // Should return mock data structure
      expect(result.kpis).toBeDefined();
      expect(result.kpis.ir).toBeDefined();
      expect(result.kpis.annualReturn).toBeDefined();
      expect(result.kpis.maxDrawdown).toBeDefined();
      expect(result.pnlData).toBeDefined();
    });

    it('should return mock data on network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      // The service falls back to mock data instead of throwing
      const result = await simulateBacktest('rank(close, 20)', mockConfig);

      // Should return mock data structure
      expect(result.kpis).toBeDefined();
      expect(result.pnlData).toBeDefined();
      expect(Array.isArray(result.pnlData)).toBe(true);
    });

    it('should return mock data on invalid response format', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }), // Missing kpis and pnlData
      });

      // The service falls back to mock data
      const result = await simulateBacktest('rank(close, 20)', mockConfig);

      expect(result.kpis).toBeDefined();
      expect(result.pnlData).toBeDefined();
    });

    it('should work without optional config', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const result = await simulateBacktest('rank(close, 20)');

      expect(result).toEqual(mockSuccessResponse);
    });

    it('should validate kpis structure in response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          kpis: {
            ir: 1.2,
            annualReturn: 0.18,
            maxDrawdown: -0.05,
            turnover: 0.1,
            margin: 0.0012,
            correlation: 0.08,
          },
          pnlData: [{ day: 1, value: 1000 }],
        }),
      });

      const result = await simulateBacktest('momentum_score');

      expect(result.kpis).toHaveProperty('ir');
      expect(result.kpis).toHaveProperty('annualReturn');
      expect(result.kpis).toHaveProperty('maxDrawdown');
      expect(result.kpis).toHaveProperty('turnover');
      expect(result.kpis).toHaveProperty('margin');
      expect(result.kpis).toHaveProperty('correlation');
    });

    it('should handle benchmark data in response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const result = await simulateBacktest('rank(close, 20)');

      expect(result.benchmark).toBeDefined();
      expect(result.benchmark?.name).toBe('S&P 500');
      expect(result.benchmark?.data).toHaveLength(3);
      expect(result.benchmark?.return).toBe(0.008);
    });

    it('should handle trades data in response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const result = await simulateBacktest('rank(close, 20)');

      expect(result.trades).toBeDefined();
      expect(result.trades).toHaveLength(1);
      expect(result.trades?.[0].symbol).toBe('AAPL');
      expect(result.trades?.[0].sector).toBe('Technology');
      expect(result.trades?.[0].action).toBe('BUY');
    });
  });
});
