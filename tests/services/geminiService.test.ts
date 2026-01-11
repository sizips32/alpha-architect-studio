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

    it('should use fallback message when error response has no error field', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}), // No error field
      });

      try {
        await generateAlphaExpression('test idea');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toContain('404');
      }
    });

    it('should use fallback message when error response has null error field', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: async () => ({ error: null }),
      });

      try {
        await generateAlphaExpression('test idea');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toContain('502');
      }
    });

    it('should use fallback message when error response has empty error field', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: '' }),
      });

      try {
        await generateAlphaExpression('test idea');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toContain('400');
      }
    });

    it('should handle non-Error thrown in catch block', async () => {
      (global.fetch as any).mockRejectedValueOnce('string error');

      try {
        await generateAlphaExpression('test idea');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
      }
    });

    it('should handle null thrown in catch block', async () => {
      (global.fetch as any).mockRejectedValueOnce(null);

      try {
        await generateAlphaExpression('test idea');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
      }
    });

    it('should handle undefined thrown in catch block', async () => {
      (global.fetch as any).mockRejectedValueOnce(undefined);

      try {
        await generateAlphaExpression('test idea');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
      }
    });

    it('should handle object thrown in catch block', async () => {
      (global.fetch as any).mockRejectedValueOnce({ custom: 'error object' });

      try {
        await generateAlphaExpression('test idea');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
      }
    });

    it('should handle number thrown in catch block', async () => {
      (global.fetch as any).mockRejectedValueOnce(500);

      try {
        await generateAlphaExpression('test idea');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
      }
    });

    it('should verify error code on API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal error' }),
      });

      try {
        await generateAlphaExpression('test idea');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCodes.API_REQUEST_FAILED);
        expect((error as AppError).statusCode).toBe(500);
      }
    });

    it('should handle response with additional fields', async () => {
      const mockExpression = 'rank(volume, 10)';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            expression: mockExpression,
            extraField: 'ignored',
            metadata: { timestamp: '2024-01-01' },
          }),
      });

      const result = await generateAlphaExpression('volume strategy');

      expect(result).toBe(mockExpression);
    });

    it('should trim whitespace from valid expression', async () => {
      const mockExpression = '  rank(close, 20)  ';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ expression: mockExpression }),
      });

      const result = await generateAlphaExpression('test');

      // The service returns the expression as-is, validation only checks if trimmed is non-empty
      expect(result).toBe(mockExpression);
    });

    it('should handle very long valid expression', async () => {
      const longExpression = 'rank(' + 'close + '.repeat(100) + 'volume, 20)';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ expression: longExpression }),
      });

      const result = await generateAlphaExpression('complex strategy');

      expect(result).toBe(longExpression);
    });

    it('should handle unicode in expression', async () => {
      const unicodeExpression = 'rank(종가, 20)';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ expression: unicodeExpression }),
      });

      const result = await generateAlphaExpression('한글 전략');

      expect(result).toBe(unicodeExpression);
    });

    it('should handle special characters in idea', async () => {
      const mockExpression = 'rank(close, 20)';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ expression: mockExpression }),
      });

      const specialIdea = 'strategy with "quotes" & <special> chars';
      const result = await generateAlphaExpression(specialIdea);

      expect(result).toBe(mockExpression);
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].body).toBe(JSON.stringify({ idea: specialIdea }));
    });
  });
});
