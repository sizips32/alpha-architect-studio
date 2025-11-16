import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAlphaExpression } from '../services/geminiService';
import { AppError, ErrorCodes } from '../utils/errorHandler';

// Mock fetch
global.fetch = vi.fn();

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAlphaExpression', () => {
    it('should throw error for empty idea', async () => {
      await expect(generateAlphaExpression('')).rejects.toThrow(AppError);
      await expect(generateAlphaExpression('   ')).rejects.toThrow(AppError);
    });

    it('should return expression on success', async () => {
      const mockExpression = 'rank(returns, 20)';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ expression: mockExpression }),
      });

      const result = await generateAlphaExpression('momentum strategy');
      
      expect(result).toBe(mockExpression);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/generate_alpha_expression'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should throw error on API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      await expect(generateAlphaExpression('test idea')).rejects.toThrow(AppError);
    });

    it('should throw error on invalid response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Missing expression
      });

      await expect(generateAlphaExpression('test idea')).rejects.toThrow(AppError);
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(generateAlphaExpression('test idea')).rejects.toThrow(AppError);
    });
  });
});

