import { describe, it, expect } from 'vitest';
import { AppError, ErrorCodes, handleServiceError, getUserFriendlyMessage } from '../utils/errorHandler';

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
      const error = new Error('Network request failed');
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
  });
});

