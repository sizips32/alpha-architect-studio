import { describe, it, expect } from 'vitest';
import {
  AppError,
  ErrorCodes,
  handleServiceError,
  getUserFriendlyMessage,
} from '../../utils/errorHandler';

describe('errorHandler', () => {
  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError('Test error', ErrorCodes.UNKNOWN_ERROR, 500);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCodes.UNKNOWN_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should accept optional details', () => {
      const details = { field: 'test' };
      const error = new AppError('Test', ErrorCodes.VALIDATION_ERROR, 400, details);

      expect(error.details).toEqual(details);
    });
  });

  describe('handleServiceError', () => {
    it('should return AppError as-is', () => {
      const appError = new AppError('Test', ErrorCodes.UNKNOWN_ERROR);
      const result = handleServiceError(appError);

      expect(result).toBe(appError);
    });

    it('should wrap Error with AppError', () => {
      const error = new Error('Test error');
      const result = handleServiceError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Test error');
      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR);
    });

    it('should detect API key errors', () => {
      const error = new Error('API key is missing');
      const result = handleServiceError(error);

      expect(result.code).toBe(ErrorCodes.API_KEY_MISSING);
      expect(result.statusCode).toBe(401);
    });

    it('should detect network errors', () => {
      const error = new Error('network request failed');
      const result = handleServiceError(error);

      expect(result.code).toBe(ErrorCodes.NETWORK_ERROR);
      expect(result.statusCode).toBe(503);
    });

    it('should handle unknown error types', () => {
      const result = handleServiceError('string error');

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR);
    });

    it('should detect timeout errors', () => {
      const error = new Error('Request timeout exceeded');
      const result = handleServiceError(error);

      expect(result.code).toBe(ErrorCodes.TIMEOUT_ERROR);
      expect(result.statusCode).toBe(504);
      expect(result.message).toBe('Request timed out');
    });

    it('should detect API_KEY in error message', () => {
      const error = new Error('Missing API_KEY configuration');
      const result = handleServiceError(error);

      expect(result.code).toBe(ErrorCodes.API_KEY_MISSING);
      expect(result.statusCode).toBe(401);
    });

    it('should detect fetch errors as network errors', () => {
      const error = new Error('Failed to fetch data');
      const result = handleServiceError(error);

      expect(result.code).toBe(ErrorCodes.NETWORK_ERROR);
      expect(result.statusCode).toBe(503);
    });

    it('should handle null error', () => {
      const result = handleServiceError(null);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR);
    });

    it('should handle undefined error', () => {
      const result = handleServiceError(undefined);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR);
    });

    it('should handle number as error', () => {
      const result = handleServiceError(404);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR);
    });

    it('should handle object as error', () => {
      const result = handleServiceError({ error: 'test' });

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return Korean message for API_KEY_MISSING', () => {
      const error = new AppError('API key missing', ErrorCodes.API_KEY_MISSING);
      const message = getUserFriendlyMessage(error);

      expect(message).toContain('API 키');
    });

    it('should return Korean message for NETWORK_ERROR', () => {
      const error = new AppError('Network failed', ErrorCodes.NETWORK_ERROR);
      const message = getUserFriendlyMessage(error);

      expect(message).toContain('네트워크');
    });

    it('should return error message for unknown AppError', () => {
      const error = new AppError('Custom error', 'CUSTOM_CODE' as any);
      const message = getUserFriendlyMessage(error);

      expect(message).toBe('Custom error');
    });

    it('should return message for regular Error', () => {
      const error = new Error('Regular error');
      const message = getUserFriendlyMessage(error);

      expect(message).toBe('Regular error');
    });

    it('should return default message for unknown types', () => {
      const message = getUserFriendlyMessage('string');

      expect(message).toBe('알 수 없는 오류가 발생했습니다.');
    });

    it('should return Korean message for DATA_NOT_FOUND', () => {
      const error = new AppError('Data not found', ErrorCodes.DATA_NOT_FOUND);
      const message = getUserFriendlyMessage(error);

      expect(message).toBe('요청한 데이터를 찾을 수 없습니다.');
    });

    it('should return Korean message for INVALID_TICKER', () => {
      const error = new AppError('Invalid ticker', ErrorCodes.INVALID_TICKER);
      const message = getUserFriendlyMessage(error);

      expect(message).toBe('유효하지 않은 주식 심볼입니다.');
    });

    it('should return Korean message for INVALID_EXPRESSION', () => {
      const error = new AppError('Invalid expression', ErrorCodes.INVALID_EXPRESSION);
      const message = getUserFriendlyMessage(error);

      expect(message).toBe('유효하지 않은 alpha 표현식입니다.');
    });

    it('should return Korean message for BACKTEST_FAILED', () => {
      const error = new AppError('Backtest failed', ErrorCodes.BACKTEST_FAILED);
      const message = getUserFriendlyMessage(error);

      expect(message).toBe('백테스트 실행에 실패했습니다.');
    });

    it('should handle null input', () => {
      const message = getUserFriendlyMessage(null);

      expect(message).toBe('알 수 없는 오류가 발생했습니다.');
    });

    it('should handle undefined input', () => {
      const message = getUserFriendlyMessage(undefined);

      expect(message).toBe('알 수 없는 오류가 발생했습니다.');
    });

    it('should handle number input', () => {
      const message = getUserFriendlyMessage(500);

      expect(message).toBe('알 수 없는 오류가 발생했습니다.');
    });
  });

  describe('ErrorCodes', () => {
    it('should have all expected error codes', () => {
      expect(ErrorCodes.API_KEY_MISSING).toBe('API_KEY_MISSING');
      expect(ErrorCodes.API_REQUEST_FAILED).toBe('API_REQUEST_FAILED');
      expect(ErrorCodes.API_RATE_LIMIT).toBe('API_RATE_LIMIT');
      expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCodes.INVALID_INPUT).toBe('INVALID_INPUT');
      expect(ErrorCodes.EMPTY_INPUT).toBe('EMPTY_INPUT');
      expect(ErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorCodes.CORS_ERROR).toBe('CORS_ERROR');
      expect(ErrorCodes.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
      expect(ErrorCodes.DATA_NOT_FOUND).toBe('DATA_NOT_FOUND');
      expect(ErrorCodes.INVALID_TICKER).toBe('INVALID_TICKER');
      expect(ErrorCodes.BACKTEST_FAILED).toBe('BACKTEST_FAILED');
      expect(ErrorCodes.INVALID_EXPRESSION).toBe('INVALID_EXPRESSION');
      expect(ErrorCodes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });

  describe('AppError edge cases', () => {
    it('should use default statusCode of 500', () => {
      const error = new AppError('Test', ErrorCodes.UNKNOWN_ERROR);
      expect(error.statusCode).toBe(500);
    });

    it('should be an instance of Error', () => {
      const error = new AppError('Test', ErrorCodes.UNKNOWN_ERROR);
      expect(error).toBeInstanceOf(Error);
    });

    it('should have a stack trace', () => {
      const error = new AppError('Test', ErrorCodes.UNKNOWN_ERROR);
      expect(error.stack).toBeDefined();
    });

    it('should handle empty message', () => {
      const error = new AppError('', ErrorCodes.UNKNOWN_ERROR);
      expect(error.message).toBe('');
    });

    it('should handle complex details object', () => {
      const details = {
        field: 'test',
        nested: { value: 123 },
        array: [1, 2, 3],
      };
      const error = new AppError('Test', ErrorCodes.VALIDATION_ERROR, 400, details);
      expect(error.details).toEqual(details);
    });
  });
});
