import { describe, it, expect } from 'vitest';
import {
  isKoreanStock,
  isMarketIndex,
  formatPrice,
  formatDetailPrice,
  formatChangePercent,
  formatChartXAxis,
  formatChartYAxis,
  formatChartTooltipPrice,
  formatChartTooltipDate,
  formatMarketCap,
  formatVolume,
  format52WeekPrice,
  formatPE,
  formatEPS,
  getChangeColorClass,
  getChangeBgClass,
  getChartColor,
  formatLastUpdate,
} from '../../utils/marketTickerFormatters';

describe('marketTickerFormatters', () => {
  describe('isKoreanStock', () => {
    it('should return true for KOSPI stocks (.KS)', () => {
      expect(isKoreanStock('005930.KS')).toBe(true);
      expect(isKoreanStock('000660.KS')).toBe(true);
    });

    it('should return true for KOSDAQ stocks (.KQ)', () => {
      expect(isKoreanStock('035720.KQ')).toBe(true);
      expect(isKoreanStock('263750.KQ')).toBe(true);
    });

    it('should return true for Korean indices (^K)', () => {
      expect(isKoreanStock('^KS11')).toBe(true);
      expect(isKoreanStock('^KQ11')).toBe(true);
    });

    it('should return false for US stocks', () => {
      expect(isKoreanStock('AAPL')).toBe(false);
      expect(isKoreanStock('NVDA')).toBe(false);
      expect(isKoreanStock('MSFT')).toBe(false);
    });

    it('should return false for US indices', () => {
      expect(isKoreanStock('^GSPC')).toBe(false);
      expect(isKoreanStock('^DJI')).toBe(false);
    });
  });

  describe('isMarketIndex', () => {
    it('should return true for indices starting with ^', () => {
      expect(isMarketIndex('^GSPC')).toBe(true);
      expect(isMarketIndex('^DJI')).toBe(true);
      expect(isMarketIndex('^KS11')).toBe(true);
    });

    it('should return false for regular stocks', () => {
      expect(isMarketIndex('AAPL')).toBe(false);
      expect(isMarketIndex('005930.KS')).toBe(false);
    });
  });

  describe('formatPrice', () => {
    it('should format Korean stock price with Won symbol', () => {
      expect(formatPrice(75000, '005930.KS')).toBe('₩75,000');
      expect(formatPrice(180000, '000660.KS')).toBe('₩180,000');
    });

    it('should format Korean index price with Won symbol', () => {
      expect(formatPrice(2500, '^KS11')).toBe('₩2,500');
    });

    it('should format market index without currency symbol', () => {
      expect(formatPrice(5000.75, '^GSPC')).toBe('5,000.75');
      expect(formatPrice(35000.5, '^DJI')).toBe('35,000.50');
    });

    it('should format US stock price with Dollar symbol', () => {
      expect(formatPrice(175.5, 'AAPL')).toBe('$175.50');
      expect(formatPrice(500.25, 'NVDA')).toBe('$500.25');
    });
  });

  describe('formatDetailPrice', () => {
    it('should format Korean stock price with Won symbol', () => {
      expect(formatDetailPrice(75000, '005930.KS')).toBe('₩75,000');
      expect(formatDetailPrice(150000, '000660.KQ')).toBe('₩150,000');
    });

    it('should format US stock price with Dollar symbol and 2 decimals', () => {
      expect(formatDetailPrice(175, 'AAPL')).toBe('$175.00');
      expect(formatDetailPrice(500.567, 'NVDA')).toBe('$500.57');
    });
  });

  describe('formatChangePercent', () => {
    it('should format positive change with + sign', () => {
      expect(formatChangePercent(2.5)).toBe('+2.50%');
      expect(formatChangePercent(0.15)).toBe('+0.15%');
    });

    it('should format negative change without extra sign', () => {
      expect(formatChangePercent(-1.75)).toBe('-1.75%');
      expect(formatChangePercent(-0.5)).toBe('-0.50%');
    });

    it('should format zero change with + sign', () => {
      expect(formatChangePercent(0)).toBe('+0.00%');
    });
  });

  describe('formatChartXAxis', () => {
    it('should format date as MM/DD', () => {
      expect(formatChartXAxis('2024-01-15')).toBe('1/15');
      expect(formatChartXAxis('2024-12-25')).toBe('12/25');
    });

    it('should handle ISO date string', () => {
      expect(formatChartXAxis('2024-06-01T10:00:00Z')).toBe('6/1');
    });
  });

  describe('formatChartYAxis', () => {
    it('should format Korean stock price with k suffix', () => {
      expect(formatChartYAxis(75000, '005930.KS')).toBe('₩75k');
      expect(formatChartYAxis(150000, '000660.KQ')).toBe('₩150k');
    });

    it('should format US stock price with dollar sign', () => {
      expect(formatChartYAxis(175, 'AAPL')).toBe('$175');
      expect(formatChartYAxis(500.5, 'NVDA')).toBe('$501');
    });
  });

  describe('formatChartTooltipPrice', () => {
    it('should format Korean stock price with Won symbol', () => {
      expect(formatChartTooltipPrice(75000, '005930.KS')).toBe('₩75,000');
      expect(formatChartTooltipPrice(180500, '000660.KQ')).toBe('₩180,500');
    });

    it('should format US stock price with Dollar symbol and 2 decimals', () => {
      expect(formatChartTooltipPrice(175.5, 'AAPL')).toBe('$175.50');
      expect(formatChartTooltipPrice(500, 'NVDA')).toBe('$500.00');
    });
  });

  describe('formatChartTooltipDate', () => {
    it('should format date in Korean locale', () => {
      const result = formatChartTooltipDate('2024-01-15');
      // Korean locale format varies, but should contain year, month, day
      expect(result).toContain('2024');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });
  });

  describe('formatMarketCap', () => {
    it('should format trillion values with T suffix', () => {
      expect(formatMarketCap(2.5e12)).toBe('2.50T');
      expect(formatMarketCap(1.234e12)).toBe('1.23T');
    });

    it('should format billion values with B suffix', () => {
      expect(formatMarketCap(500e9)).toBe('500.00B');
      expect(formatMarketCap(1.5e9)).toBe('1.50B');
    });

    it('should format million values with M suffix', () => {
      expect(formatMarketCap(500e6)).toBe('500.00M');
      expect(formatMarketCap(1.5e6)).toBe('1.50M');
    });

    it('should handle edge cases around thresholds', () => {
      // > 1e12 gets T suffix, exactly 1e12 gets B suffix
      expect(formatMarketCap(1e12)).toBe('1000.00B');
      expect(formatMarketCap(1.01e12)).toBe('1.01T');
      // > 1e9 gets B suffix, exactly 1e9 gets M suffix
      expect(formatMarketCap(1e9)).toBe('1000.00M');
      expect(formatMarketCap(1.01e9)).toBe('1.01B');
    });
  });

  describe('formatVolume', () => {
    it('should format volume with locale string', () => {
      expect(formatVolume(1000000)).toBe('1,000,000');
      expect(formatVolume(5000)).toBe('5,000');
    });

    it('should handle zero volume', () => {
      expect(formatVolume(0)).toBe('0');
    });
  });

  describe('format52WeekPrice', () => {
    it('should format Korean stock price with Won symbol', () => {
      expect(format52WeekPrice(85000, '005930.KS')).toBe('₩85,000');
      expect(format52WeekPrice(200000, '000660.KQ')).toBe('₩200,000');
    });

    it('should format US stock price with Dollar symbol', () => {
      expect(format52WeekPrice(199.99, 'AAPL')).toBe('$199.99');
      expect(format52WeekPrice(600, 'NVDA')).toBe('$600.00');
    });
  });

  describe('formatPE', () => {
    it('should format PE ratio with 2 decimal places', () => {
      expect(formatPE(25.5)).toBe('25.50');
      expect(formatPE(10)).toBe('10.00');
      expect(formatPE(15.678)).toBe('15.68');
    });
  });

  describe('formatEPS', () => {
    it('should format EPS with 2 decimal places', () => {
      expect(formatEPS(6.15)).toBe('6.15');
      expect(formatEPS(10)).toBe('10.00');
      expect(formatEPS(3.567)).toBe('3.57');
    });
  });

  describe('getChangeColorClass', () => {
    it('should return green class for positive change', () => {
      expect(getChangeColorClass(2.5)).toBe('text-green-400');
      expect(getChangeColorClass(0.01)).toBe('text-green-400');
    });

    it('should return green class for zero change', () => {
      expect(getChangeColorClass(0)).toBe('text-green-400');
    });

    it('should return red class for negative change', () => {
      expect(getChangeColorClass(-1.5)).toBe('text-red-400');
      expect(getChangeColorClass(-0.01)).toBe('text-red-400');
    });
  });

  describe('getChangeBgClass', () => {
    it('should return green background for positive change', () => {
      expect(getChangeBgClass(2.5)).toBe('bg-green-500/10');
      expect(getChangeBgClass(0)).toBe('bg-green-500/10');
    });

    it('should return red background for negative change', () => {
      expect(getChangeBgClass(-1.5)).toBe('bg-red-500/10');
    });
  });

  describe('getChartColor', () => {
    it('should return green color for positive', () => {
      expect(getChartColor(true)).toBe('#10B981');
    });

    it('should return red color for negative', () => {
      expect(getChartColor(false)).toBe('#EF4444');
    });
  });

  describe('formatLastUpdate', () => {
    it('should format date in Korean time locale', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatLastUpdate(date);
      // Korean locale time format
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });
  });
});
