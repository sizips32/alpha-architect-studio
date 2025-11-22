/**
 * Standardized error handling utilities
 */

/**
 * Custom application error class with error codes
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Error codes used throughout the application
 */
export const ErrorCodes = {
  // API Errors
  API_KEY_MISSING: 'API_KEY_MISSING',
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  API_RATE_LIMIT: 'API_RATE_LIMIT',

  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  EMPTY_INPUT: 'EMPTY_INPUT',

  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  CORS_ERROR: 'CORS_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Data Errors
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  INVALID_TICKER: 'INVALID_TICKER',

  // Backtest Errors
  BACKTEST_FAILED: 'BACKTEST_FAILED',
  INVALID_EXPRESSION: 'INVALID_EXPRESSION',

  // Unknown Errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Handles service errors and converts them to AppError
 * @param error - The error to handle
 * @returns AppError instance
 */
export const handleServiceError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('API key') || error.message.includes('API_KEY')) {
      return new AppError('API key is missing or invalid', ErrorCodes.API_KEY_MISSING, 401);
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new AppError(error.message, ErrorCodes.NETWORK_ERROR, 503);
    }

    if (error.message.includes('timeout')) {
      return new AppError('Request timed out', ErrorCodes.TIMEOUT_ERROR, 504);
    }

    // Default error wrapping
    return new AppError(error.message, ErrorCodes.UNKNOWN_ERROR, 500);
  }

  // Unknown error type
  return new AppError('An unexpected error occurred', ErrorCodes.UNKNOWN_ERROR, 500);
};

/**
 * Creates a user-friendly error message from an error
 * @param error - The error to format
 * @returns User-friendly error message
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    switch (error.code) {
      case ErrorCodes.API_KEY_MISSING:
        return 'API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.';
      case ErrorCodes.NETWORK_ERROR:
        return '네트워크 연결을 확인해주세요.';
      case ErrorCodes.DATA_NOT_FOUND:
        return '요청한 데이터를 찾을 수 없습니다.';
      case ErrorCodes.INVALID_TICKER:
        return '유효하지 않은 주식 심볼입니다.';
      case ErrorCodes.INVALID_EXPRESSION:
        return '유효하지 않은 alpha 표현식입니다.';
      case ErrorCodes.BACKTEST_FAILED:
        return '백테스트 실행에 실패했습니다.';
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
};
