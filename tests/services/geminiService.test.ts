import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAlphaExpression } from '../../services/geminiService';
import { AppError, ErrorCodes } from '../../utils/errorHandler';

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
        text: async () => JSON.stringify({ expression: mockExpression }),
      });

      const result = await generateAlphaExpression('momentum strategy');

      expect(result).toBe(mockExpression);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/generate_alpha_expression'),
        expect.objectContaining({
          method: 'POST',
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
        text: async () => JSON.stringify({}), // Missing expression
      });

      await expect(generateAlphaExpression('test idea')).rejects.toThrow(AppError);
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(generateAlphaExpression('test idea')).rejects.toThrow(AppError);
    });

    it('should throw error on invalid JSON response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => 'not valid json {{{',
      });

      try {
        await generateAlphaExpression('test idea');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toBe('Invalid JSON response from server');
      }
    });

    it('should throw error when response is null', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(null),
      });

      try {
        await generateAlphaExpression('test idea');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toBe('Invalid response structure from server');
      }
    });

    it('should throw error when response is not an object', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify('just a string'),
      });

      await expect(generateAlphaExpression('test idea')).rejects.toThrow(AppError);
    });

    it('should throw error when response is an array', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify([1, 2, 3]),
      });

      await expect(generateAlphaExpression('test idea')).rejects.toThrow(AppError);
    });

    it('should throw error when expression is empty string', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ expression: '' }),
      });

      try {
        await generateAlphaExpression('test idea');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toBe('Invalid or empty expression in server response');
      }
    });

    it('should throw error when expression is whitespace only', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ expression: '   ' }),
      });

      await expect(generateAlphaExpression('test idea')).rejects.toThrow(AppError);
    });

    it('should throw error when expression is not a string', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ expression: 123 }),
      });

      await expect(generateAlphaExpression('test idea')).rejects.toThrow(AppError);
    });

    it('should throw error when expression is null', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ expression: null }),
      });

      await expect(generateAlphaExpression('test idea')).rejects.toThrow(AppError);
    });

    it('should handle API error with fallback message', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => {
          throw new Error('JSON parse failed');
        },
      });

      await expect(generateAlphaExpression('test idea')).rejects.toThrow(AppError);
    });

    it('should include correct headers in request', async () => {
      const mockExpression = 'rank(close, 20)';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ expression: mockExpression }),
      });

      await generateAlphaExpression('test idea');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Accept: 'application/json',
          },
          body: JSON.stringify({ idea: 'test idea' }),
        })
      );
    });

    it('should throw specific error code for empty input', async () => {
      try {
        await generateAlphaExpression('');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCodes.EMPTY_INPUT);
        expect((error as AppError).statusCode).toBe(400);
      }
    });

    it('should handle long response text in error logging', async () => {
      const longInvalidJson = 'x'.repeat(500);
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => longInvalidJson,
      });

      await expect(generateAlphaExpression('test idea')).rejects.toThrow(AppError);
    });
  });
});
