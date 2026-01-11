import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, LogLevel } from '../../utils/logger';

describe('logger', () => {
  const consoleSpy = {
    debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('LogLevel enum', () => {
    it('should have correct numeric values', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
    });

    it('should have correct string names', () => {
      expect(LogLevel[0]).toBe('DEBUG');
      expect(LogLevel[1]).toBe('INFO');
      expect(LogLevel[2]).toBe('WARN');
      expect(LogLevel[3]).toBe('ERROR');
    });
  });

  describe('debug', () => {
    it('should log debug message', () => {
      logger.debug('Debug message');

      expect(consoleSpy.debug).toHaveBeenCalled();
      const logMessage = consoleSpy.debug.mock.calls[0][0];
      expect(logMessage).toContain('[DEBUG]');
      expect(logMessage).toContain('Debug message');
    });

    it('should log debug message with context', () => {
      logger.debug('Debug with context', { key: 'value', num: 123 });

      expect(consoleSpy.debug).toHaveBeenCalled();
      const logMessage = consoleSpy.debug.mock.calls[0][0];
      expect(logMessage).toContain('Debug with context');
      expect(logMessage).toContain('"key":"value"');
      expect(logMessage).toContain('"num":123');
    });

    it('should include timestamp in debug message', () => {
      logger.debug('Timestamp test');

      const logMessage = consoleSpy.debug.mock.calls[0][0];
      // ISO timestamp format check (e.g., 2024-01-15T10:30:00.000Z)
      expect(logMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('info', () => {
    it('should log info message', () => {
      logger.info('Info message');

      expect(consoleSpy.info).toHaveBeenCalled();
      const logMessage = consoleSpy.info.mock.calls[0][0];
      expect(logMessage).toContain('[INFO]');
      expect(logMessage).toContain('Info message');
    });

    it('should log info message with context', () => {
      logger.info('Info with context', { action: 'test', status: 'success' });

      expect(consoleSpy.info).toHaveBeenCalled();
      const logMessage = consoleSpy.info.mock.calls[0][0];
      expect(logMessage).toContain('"action":"test"');
      expect(logMessage).toContain('"status":"success"');
    });
  });

  describe('warn', () => {
    it('should log warn message', () => {
      logger.warn('Warning message');

      expect(consoleSpy.warn).toHaveBeenCalled();
      const logMessage = consoleSpy.warn.mock.calls[0][0];
      expect(logMessage).toContain('[WARN]');
      expect(logMessage).toContain('Warning message');
    });

    it('should log warn message with context', () => {
      logger.warn('Warning with context', { reason: 'deprecated', count: 5 });

      expect(consoleSpy.warn).toHaveBeenCalled();
      const logMessage = consoleSpy.warn.mock.calls[0][0];
      expect(logMessage).toContain('"reason":"deprecated"');
      expect(logMessage).toContain('"count":5');
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      logger.error('Error message');

      expect(consoleSpy.error).toHaveBeenCalled();
      const logMessage = consoleSpy.error.mock.calls[0][0];
      expect(logMessage).toContain('[ERROR]');
      expect(logMessage).toContain('Error message');
    });

    it('should log error message with Error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(consoleSpy.error).toHaveBeenCalled();
      const logMessage = consoleSpy.error.mock.calls[0][0];
      expect(logMessage).toContain('Error occurred');
      expect(logMessage).toContain('Error: Test error');
    });

    it('should log error message with context', () => {
      logger.error('Error with context', undefined, { errorCode: 500, path: '/api' });

      expect(consoleSpy.error).toHaveBeenCalled();
      const logMessage = consoleSpy.error.mock.calls[0][0];
      expect(logMessage).toContain('"errorCode":500');
      expect(logMessage).toContain('"path":"/api"');
    });

    it('should log error message with both Error and context', () => {
      const error = new Error('Combined error');
      logger.error('Full error log', error, { userId: 'user123' });

      expect(consoleSpy.error).toHaveBeenCalled();
      const logMessage = consoleSpy.error.mock.calls[0][0];
      expect(logMessage).toContain('Full error log');
      expect(logMessage).toContain('Error: Combined error');
      expect(logMessage).toContain('"userId":"user123"');
    });

    it('should include stack trace in error log', () => {
      const error = new Error('Stack trace test');
      logger.error('Error with stack', error);

      const logMessage = consoleSpy.error.mock.calls[0][0];
      expect(logMessage).toContain('Error: Stack trace test');
      // Stack trace should be included
      expect(logMessage).toContain('at ');
    });
  });

  describe('context handling', () => {
    it('should handle empty context object', () => {
      logger.info('Empty context', {});

      const logMessage = consoleSpy.info.mock.calls[0][0];
      expect(logMessage).toContain('{}');
    });

    it('should handle nested context object', () => {
      logger.info('Nested context', {
        user: { id: 1, name: 'test' },
        data: [1, 2, 3],
      });

      const logMessage = consoleSpy.info.mock.calls[0][0];
      expect(logMessage).toContain('"user":{"id":1,"name":"test"}');
      expect(logMessage).toContain('"data":[1,2,3]');
    });

    it('should handle undefined context', () => {
      logger.info('No context');

      const logMessage = consoleSpy.info.mock.calls[0][0];
      // Should not contain extra JSON when no context
      expect(logMessage).not.toContain('{}');
      expect(logMessage).toContain('No context');
    });

    it('should handle boolean values in context', () => {
      logger.debug('Boolean context', { enabled: true, disabled: false });

      const logMessage = consoleSpy.debug.mock.calls[0][0];
      expect(logMessage).toContain('"enabled":true');
      expect(logMessage).toContain('"disabled":false');
    });

    it('should handle null values in context', () => {
      logger.debug('Null context', { value: null });

      const logMessage = consoleSpy.debug.mock.calls[0][0];
      expect(logMessage).toContain('"value":null');
    });
  });

  describe('message formatting', () => {
    it('should format message with all components', () => {
      const error = new Error('Format test');
      logger.error('Complete format', error, { key: 'value' });

      const logMessage = consoleSpy.error.mock.calls[0][0];
      // Check all components are present
      expect(logMessage).toMatch(/\[.*\]/); // Timestamp
      expect(logMessage).toContain('[ERROR]'); // Level
      expect(logMessage).toContain('Complete format'); // Message
      expect(logMessage).toContain('"key":"value"'); // Context
      expect(logMessage).toContain('Error: Format test'); // Error
    });

    it('should handle special characters in message', () => {
      logger.info('Message with "quotes" and \'apostrophes\'');

      const logMessage = consoleSpy.info.mock.calls[0][0];
      expect(logMessage).toContain('Message with "quotes" and \'apostrophes\'');
    });

    it('should handle unicode in message', () => {
      logger.info('한글 메시지 테스트');

      const logMessage = consoleSpy.info.mock.calls[0][0];
      expect(logMessage).toContain('한글 메시지 테스트');
    });

    it('should handle empty message', () => {
      logger.info('');

      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('should handle very long message', () => {
      const longMessage = 'A'.repeat(1000);
      logger.info(longMessage);

      const logMessage = consoleSpy.info.mock.calls[0][0];
      expect(logMessage).toContain(longMessage);
    });
  });

  describe('logger instance', () => {
    it('should be a singleton', () => {
      // logger is exported as a singleton instance
      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('multiple log calls', () => {
    it('should handle multiple consecutive log calls', () => {
      logger.debug('First');
      logger.info('Second');
      logger.warn('Third');
      logger.error('Fourth');

      expect(consoleSpy.debug).toHaveBeenCalledTimes(1);
      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid successive calls', () => {
      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }

      expect(consoleSpy.info).toHaveBeenCalledTimes(10);
    });
  });

  describe('log level filtering', () => {
    it('should filter logs below minLevel in production mode', () => {
      // Access private minLevel to simulate production mode
      const loggerAny = logger as any;
      const originalMinLevel = loggerAny.minLevel;

      // Set minLevel to WARN (production behavior)
      loggerAny.minLevel = LogLevel.WARN;

      // Clear previous calls
      vi.clearAllMocks();

      // DEBUG and INFO should be filtered out
      logger.debug('Should not appear');
      logger.info('Should not appear either');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();

      // WARN and ERROR should still log
      logger.warn('Should appear');
      logger.error('Should also appear');

      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);

      // Restore original minLevel
      loggerAny.minLevel = originalMinLevel;
    });

    it('should filter logs at ERROR level only when minLevel is ERROR', () => {
      const loggerAny = logger as any;
      const originalMinLevel = loggerAny.minLevel;

      // Set minLevel to ERROR
      loggerAny.minLevel = LogLevel.ERROR;

      vi.clearAllMocks();

      // DEBUG, INFO, and WARN should be filtered out
      logger.debug('Filtered');
      logger.info('Filtered');
      logger.warn('Filtered');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();

      // Only ERROR should log
      logger.error('Should appear');
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);

      // Restore original minLevel
      loggerAny.minLevel = originalMinLevel;
    });

    it('should log all levels when minLevel is DEBUG', () => {
      const loggerAny = logger as any;
      const originalMinLevel = loggerAny.minLevel;

      // Ensure minLevel is DEBUG
      loggerAny.minLevel = LogLevel.DEBUG;

      vi.clearAllMocks();

      logger.debug('Debug log');
      logger.info('Info log');
      logger.warn('Warn log');
      logger.error('Error log');

      expect(consoleSpy.debug).toHaveBeenCalledTimes(1);
      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);

      // Restore original minLevel
      loggerAny.minLevel = originalMinLevel;
    });

    it('should filter INFO when minLevel is INFO', () => {
      const loggerAny = logger as any;
      const originalMinLevel = loggerAny.minLevel;

      // Set minLevel to INFO
      loggerAny.minLevel = LogLevel.INFO;

      vi.clearAllMocks();

      // DEBUG should be filtered
      logger.debug('Filtered debug');
      expect(consoleSpy.debug).not.toHaveBeenCalled();

      // INFO, WARN, ERROR should log
      logger.info('Info log');
      logger.warn('Warn log');
      logger.error('Error log');

      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);

      // Restore original minLevel
      loggerAny.minLevel = originalMinLevel;
    });
  });

  describe('edge cases', () => {
    it('should handle error without stack trace', () => {
      const error = new Error('No stack');
      // Remove stack trace
      error.stack = undefined;

      logger.error('Error without stack', error);

      expect(consoleSpy.error).toHaveBeenCalled();
      const logMessage = consoleSpy.error.mock.calls[0][0];
      expect(logMessage).toContain('Error: No stack');
    });

    it('should handle context with undefined values', () => {
      logger.info('Undefined in context', { defined: 'value', undef: undefined });

      expect(consoleSpy.info).toHaveBeenCalled();
      const logMessage = consoleSpy.info.mock.calls[0][0];
      expect(logMessage).toContain('"defined":"value"');
    });

    it('should handle context with Date objects', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      logger.info('Date in context', { timestamp: date });

      expect(consoleSpy.info).toHaveBeenCalled();
      const logMessage = consoleSpy.info.mock.calls[0][0];
      expect(logMessage).toContain('2024-01-15');
    });

    it('should handle context with numeric string keys', () => {
      logger.debug('Numeric keys', { '123': 'value', '456': 'another' });

      expect(consoleSpy.debug).toHaveBeenCalled();
      const logMessage = consoleSpy.debug.mock.calls[0][0];
      expect(logMessage).toContain('"123":"value"');
    });
  });
});
