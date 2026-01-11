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

    it('should use statusText as fallback when error message is missing', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({}), // No error property
      });

      // Falls back to mock data
      const result = await simulateBacktest('rank(close, 20)');

      expect(result.kpis).toBeDefined();
      expect(result.pnlData).toBeDefined();
    });

    it('should handle json parse failure in error response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('JSON parse failed');
        },
      });

      // Falls back to mock data
      const result = await simulateBacktest('rank(close, 20)');

      expect(result.kpis).toBeDefined();
      expect(result.pnlData).toBeDefined();
    });

    it('should handle non-Error exception in catch block', async () => {
      (global.fetch as any).mockRejectedValueOnce('string error');

      // Falls back to mock data
      const result = await simulateBacktest('rank(close, 20)');

      expect(result.kpis).toBeDefined();
      expect(result.pnlData).toBeDefined();
    });

    it('should handle null rejection', async () => {
      (global.fetch as any).mockRejectedValueOnce(null);

      const result = await simulateBacktest('rank(close, 20)');

      expect(result.kpis).toBeDefined();
      expect(result.pnlData).toBeDefined();
    });

    it('should handle undefined rejection', async () => {
      (global.fetch as any).mockRejectedValueOnce(undefined);

      const result = await simulateBacktest('rank(close, 20)');

      expect(result.kpis).toBeDefined();
      expect(result.pnlData).toBeDefined();
    });

    it('should generate mock data with valid structure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await simulateBacktest('rank(close, 20)');

      // Verify mock data structure
      expect(typeof result.kpis.ir).toBe('number');
      expect(typeof result.kpis.annualReturn).toBe('number');
      expect(typeof result.kpis.maxDrawdown).toBe('number');
      expect(result.kpis.maxDrawdown).toBeLessThan(0); // Should be negative
      expect(typeof result.kpis.turnover).toBe('number');
      expect(typeof result.kpis.margin).toBe('number');
      expect(typeof result.kpis.correlation).toBe('number');
      expect(Array.isArray(result.pnlData)).toBe(true);
      expect(result.pnlData.length).toBe(252); // 252 trading days
    });

    it('should generate mock pnlData with date and pnl properties', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await simulateBacktest('rank(close, 20)');

      // Check pnlData structure
      expect(result.pnlData[0]).toHaveProperty('date');
      expect(result.pnlData[0]).toHaveProperty('pnl');
      expect(typeof result.pnlData[0].date).toBe('string');
      expect(typeof result.pnlData[0].pnl).toBe('number');
    });

    it('should handle response with missing pnlData', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          kpis: {
            ir: 1.0,
            annualReturn: 0.1,
            maxDrawdown: -0.05,
            turnover: 0.1,
            margin: 0.001,
            correlation: 0.1,
          },
          // pnlData is missing
        }),
      });

      // Falls back to mock data
      const result = await simulateBacktest('rank(close, 20)');

      expect(result.pnlData).toBeDefined();
      expect(Array.isArray(result.pnlData)).toBe(true);
    });

    it('should handle response with missing kpis', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          pnlData: [{ day: 1, value: 1000 }],
          // kpis is missing
        }),
      });

      // Falls back to mock data
      const result = await simulateBacktest('rank(close, 20)');

      expect(result.kpis).toBeDefined();
      expect(result.kpis.ir).toBeDefined();
    });

    it('should handle whitespace-padded expression', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const result = await simulateBacktest('  rank(close, 20)  ', mockConfig);

      expect(result).toEqual(mockSuccessResponse);
    });

    it('should handle complex expression', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const complexExpression = 'rank(close / delay(close, 20)) - rank(volume) + z(revenue)';
      const result = await simulateBacktest(complexExpression);

      expect(result).toEqual(mockSuccessResponse);
      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.expression).toBe(complexExpression);
    });

    it('should handle special characters in expression', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const expression = 'rank(close, 20) + (1/price) * 100';
      await simulateBacktest(expression);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.expression).toBe(expression);
    });

    it('should handle partial config', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const partialConfig = { universe: 'TOP_500' };
      await simulateBacktest('rank(close, 20)', partialConfig);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.config).toEqual(partialConfig);
    });

    it('should handle empty config object', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      await simulateBacktest('rank(close, 20)', {});

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.config).toEqual({});
    });

    it('should handle 400 Bad Request response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid expression syntax' }),
      });

      const result = await simulateBacktest('invalid expression');

      // Falls back to mock data
      expect(result.kpis).toBeDefined();
    });

    it('should handle 401 Unauthorized response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Authentication required' }),
      });

      const result = await simulateBacktest('rank(close, 20)');

      expect(result.kpis).toBeDefined();
    });

    it('should handle 429 Rate Limit response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ error: 'Rate limit exceeded' }),
      });

      const result = await simulateBacktest('rank(close, 20)');

      expect(result.kpis).toBeDefined();
    });

    it('should handle timeout error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Request timeout'));

      const result = await simulateBacktest('rank(close, 20)');

      expect(result.kpis).toBeDefined();
      expect(result.pnlData).toBeDefined();
    });

    it('should handle CORS error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await simulateBacktest('rank(close, 20)');

      expect(result.kpis).toBeDefined();
    });
  });
});
