import { describe, it, expect } from 'vitest';
import {
  formatYAxis,
  formatPercent,
  formatDayLabel,
  formatComparisonTooltip,
  formatComparisonLegend,
  formatReturnsTooltip,
  formatDrawdownTooltip,
  formatPnlTooltip,
  calculateEnhancedData,
  calculateStats,
  getDefaultStats,
} from '../../utils/chartFormatters';

describe('chartFormatters', () => {
  describe('formatYAxis', () => {
    it('should format positive number with locale string', () => {
      expect(formatYAxis(1000)).toBe('1,000');
    });

    it('should format large number with locale string', () => {
      expect(formatYAxis(1234567)).toBe('1,234,567');
    });

    it('should format zero', () => {
      expect(formatYAxis(0)).toBe('0');
    });

    it('should format negative number', () => {
      expect(formatYAxis(-1000)).toBe('-1,000');
    });

    it('should format decimal number', () => {
      expect(formatYAxis(1000.5)).toBe('1,000.5');
    });
  });

  describe('formatPercent', () => {
    it('should format positive percentage', () => {
      expect(formatPercent(15.5)).toBe('15.5%');
    });

    it('should format negative percentage', () => {
      expect(formatPercent(-5.25)).toBe('-5.3%');
    });

    it('should format zero', () => {
      expect(formatPercent(0)).toBe('0.0%');
    });

    it('should round to 1 decimal place', () => {
      expect(formatPercent(15.567)).toBe('15.6%');
    });
  });

  describe('formatDayLabel', () => {
    it('should format numeric day', () => {
      expect(formatDayLabel(5)).toBe('Day 5');
    });

    it('should format string day', () => {
      expect(formatDayLabel('10')).toBe('Day 10');
    });
  });

  describe('formatComparisonTooltip', () => {
    it('should format portfolio value', () => {
      const result = formatComparisonTooltip(115.5, 'normalizedPortfolio');
      expect(result).toEqual(['15.50%', '포트폴리오']);
    });

    it('should format benchmark value with default name', () => {
      const result = formatComparisonTooltip(103.2, 'normalizedBenchmark');
      expect(result).toEqual(['3.20%', '벤치마크']);
    });

    it('should format benchmark value with custom name', () => {
      const result = formatComparisonTooltip(103.2, 'normalizedBenchmark', 'S&P 500');
      expect(result).toEqual(['3.20%', 'S&P 500']);
    });

    it('should format negative return', () => {
      const result = formatComparisonTooltip(95.5, 'normalizedPortfolio');
      expect(result).toEqual(['-4.50%', '포트폴리오']);
    });
  });

  describe('formatComparisonLegend', () => {
    it('should return portfolio label', () => {
      expect(formatComparisonLegend('normalizedPortfolio')).toBe('포트폴리오');
    });

    it('should return default benchmark label', () => {
      expect(formatComparisonLegend('normalizedBenchmark')).toBe('벤치마크');
    });

    it('should return custom benchmark name', () => {
      expect(formatComparisonLegend('normalizedBenchmark', 'KOSPI')).toBe('KOSPI');
    });
  });

  describe('formatReturnsTooltip', () => {
    it('should format positive return', () => {
      const result = formatReturnsTooltip(2.567);
      expect(result).toEqual(['2.567%', '일별 수익률']);
    });

    it('should format negative return', () => {
      const result = formatReturnsTooltip(-1.234);
      expect(result).toEqual(['-1.234%', '일별 수익률']);
    });

    it('should format zero return', () => {
      const result = formatReturnsTooltip(0);
      expect(result).toEqual(['0.000%', '일별 수익률']);
    });
  });

  describe('formatDrawdownTooltip', () => {
    it('should format portfolio drawdown', () => {
      const result = formatDrawdownTooltip(-5.5, 'drawdown');
      expect(result).toEqual(['-5.50%', '포트폴리오 낙폭']);
    });

    it('should format benchmark drawdown with default name', () => {
      const result = formatDrawdownTooltip(-3.2, 'benchmarkDrawdown');
      expect(result).toEqual(['-3.20%', '벤치마크 낙폭']);
    });

    it('should format benchmark drawdown with custom name', () => {
      const result = formatDrawdownTooltip(-3.2, 'benchmarkDrawdown', 'NASDAQ');
      expect(result).toEqual(['-3.20%', 'NASDAQ 낙폭']);
    });
  });

  describe('formatPnlTooltip', () => {
    it('should format portfolio value with positive cumReturn', () => {
      const result = formatPnlTooltip(1150.5, 'value', 15.05);
      expect(result.formattedValue).toBe('1,150.50');
      expect(result.cumReturnText).toBe('(+15.05%)');
      expect(result.cumReturnColor).toBe('#4ade80');
      expect(result.label).toBe('포트폴리오');
    });

    it('should format portfolio value with negative cumReturn', () => {
      const result = formatPnlTooltip(950, 'value', -5);
      expect(result.formattedValue).toBe('950.00');
      expect(result.cumReturnText).toBe('(-5%)');
      expect(result.cumReturnColor).toBe('#f87171');
      expect(result.label).toBe('포트폴리오');
    });

    it('should format portfolio value without cumReturn', () => {
      const result = formatPnlTooltip(1000, 'value', undefined);
      expect(result.formattedValue).toBe('1,000.00');
      expect(result.cumReturnText).toBeNull();
      expect(result.label).toBe('포트폴리오');
    });

    it('should format benchmark value', () => {
      const result = formatPnlTooltip(1030.5, 'benchmarkValue', undefined, 'S&P 500');
      expect(result.formattedValue).toBe('1,030.5');
      expect(result.cumReturnText).toBeNull();
      expect(result.label).toBe('S&P 500');
    });

    it('should use default benchmark name', () => {
      const result = formatPnlTooltip(1030.5, 'benchmarkValue', undefined);
      expect(result.label).toBe('벤치마크');
    });

    it('should handle zero cumReturn', () => {
      const result = formatPnlTooltip(1000, 'value', 0);
      expect(result.cumReturnText).toBe('(+0%)');
      expect(result.cumReturnColor).toBe('#4ade80');
    });
  });

  describe('getDefaultStats', () => {
    it('should return all zero stats', () => {
      const stats = getDefaultStats();
      expect(stats).toEqual({
        totalReturn: 0,
        maxDrawdown: 0,
        avgDailyReturn: 0,
        volatility: 0,
        sharpe: 0,
        winRate: 0,
        alpha: 0,
        benchmarkReturn: 0,
      });
    });
  });

  describe('calculateEnhancedData', () => {
    const mockData = [
      { day: 1, value: 1000 },
      { day: 2, value: 1050 },
      { day: 3, value: 1025 },
      { day: 4, value: 1100 },
      { day: 5, value: 1150 },
    ];

    const mockBenchmarkData = [
      { day: 1, value: 1000 },
      { day: 2, value: 1010 },
      { day: 3, value: 1005 },
      { day: 4, value: 1020 },
      { day: 5, value: 1030 },
    ];

    it('should return empty array for empty data', () => {
      expect(calculateEnhancedData([])).toEqual([]);
    });

    it('should return empty array for undefined data', () => {
      expect(calculateEnhancedData(undefined as any)).toEqual([]);
    });

    it('should calculate daily returns correctly', () => {
      const result = calculateEnhancedData(mockData);

      // First day should have 0 return
      expect(result[0].dailyReturn).toBe(0);

      // Second day: (1050 - 1000) / 1000 * 100 = 5%
      expect(result[1].dailyReturn).toBe(5);

      // Third day: (1025 - 1050) / 1050 * 100 = -2.381%
      expect(result[2].dailyReturn).toBeCloseTo(-2.381, 2);
    });

    it('should calculate drawdown correctly', () => {
      const result = calculateEnhancedData(mockData);

      // First day: no drawdown (0%)
      expect(result[0].drawdown).toBe(0);

      // Second day: peak is 1050, value is 1050, drawdown = 0%
      expect(result[1].drawdown).toBe(0);

      // Third day: peak is 1050, value is 1025, drawdown = -2.381%
      expect(result[2].drawdown).toBeCloseTo(-2.381, 2);
    });

    it('should calculate cumulative return correctly', () => {
      const result = calculateEnhancedData(mockData);

      // First day: 0%
      expect(result[0].cumReturn).toBe(0);

      // Last day: (1150 - 1000) / 1000 * 100 = 15%
      expect(result[4].cumReturn).toBe(15);
    });

    it('should calculate normalized portfolio correctly', () => {
      const result = calculateEnhancedData(mockData);

      // First day: 100 (base)
      expect(result[0].normalizedPortfolio).toBe(100);

      // Last day: (1150 / 1000) * 100 = 115
      expect(result[4].normalizedPortfolio).toBe(115);
    });

    it('should calculate benchmark data when provided', () => {
      const result = calculateEnhancedData(mockData, mockBenchmarkData);

      // First day benchmark value
      expect(result[0].benchmarkValue).toBe(1000);

      // Last day benchmark value
      expect(result[4].benchmarkValue).toBe(1030);

      // Normalized benchmark
      expect(result[0].normalizedBenchmark).toBe(100);
      expect(result[4].normalizedBenchmark).toBe(103);
    });

    it('should calculate benchmark drawdown correctly', () => {
      const result = calculateEnhancedData(mockData, mockBenchmarkData);

      // Third day: benchmark peak is 1010, value is 1005
      // drawdown = (1005 - 1010) / 1010 * 100 = -0.495%
      expect(result[2].benchmarkDrawdown).toBeCloseTo(-0.495, 2);
    });

    it('should handle single data point', () => {
      const result = calculateEnhancedData([{ day: 1, value: 1000 }]);
      expect(result).toHaveLength(1);
      expect(result[0].dailyReturn).toBe(0);
      expect(result[0].drawdown).toBe(0);
      expect(result[0].cumReturn).toBe(0);
      expect(result[0].normalizedPortfolio).toBe(100);
    });

    it('should handle no benchmark data', () => {
      const result = calculateEnhancedData(mockData);
      expect(result[0].benchmarkValue).toBeUndefined();
      expect(result[0].normalizedBenchmark).toBeNull();
    });

    it('should update peak correctly when value increases', () => {
      const data = [
        { day: 1, value: 1000 },
        { day: 2, value: 1100 },
        { day: 3, value: 1200 }, // new peak
        { day: 4, value: 1150 }, // drawdown from 1200
      ];
      const result = calculateEnhancedData(data);

      // Day 4 drawdown: (1150 - 1200) / 1200 * 100 = -4.167%
      expect(result[3].drawdown).toBeCloseTo(-4.167, 2);
    });

    it('should update benchmark peak correctly', () => {
      const data = [
        { day: 1, value: 1000 },
        { day: 2, value: 1100 },
      ];
      const benchmarkData = [
        { day: 1, value: 1000 },
        { day: 2, value: 1050 }, // new benchmark peak
      ];
      const result = calculateEnhancedData(data, benchmarkData);

      // Benchmark has no drawdown since it keeps increasing
      expect(result[1].benchmarkDrawdown).toBe(0);
    });
  });

  describe('calculateStats', () => {
    const mockEnhancedData = [
      {
        day: 1,
        value: 1000,
        dailyReturn: 0,
        drawdown: 0,
        cumReturn: 0,
        benchmarkDrawdown: 0,
        normalizedPortfolio: 100,
        normalizedBenchmark: 100,
      },
      {
        day: 2,
        value: 1050,
        dailyReturn: 5,
        drawdown: 0,
        cumReturn: 5,
        benchmarkDrawdown: 0,
        normalizedPortfolio: 105,
        normalizedBenchmark: 101,
      },
      {
        day: 3,
        value: 1025,
        dailyReturn: -2.381,
        drawdown: -2.381,
        cumReturn: 2.5,
        benchmarkDrawdown: -0.495,
        normalizedPortfolio: 102.5,
        normalizedBenchmark: 100.5,
      },
      {
        day: 4,
        value: 1100,
        dailyReturn: 7.317,
        drawdown: 0,
        cumReturn: 10,
        benchmarkDrawdown: 0,
        normalizedPortfolio: 110,
        normalizedBenchmark: 102,
      },
      {
        day: 5,
        value: 1150,
        dailyReturn: 4.545,
        drawdown: 0,
        cumReturn: 15,
        benchmarkDrawdown: 0,
        normalizedPortfolio: 115,
        normalizedBenchmark: 103,
      },
    ];

    it('should return default stats for empty data', () => {
      const stats = calculateStats([]);
      expect(stats).toEqual(getDefaultStats());
    });

    it('should return default stats for undefined data', () => {
      const stats = calculateStats(undefined as any);
      expect(stats).toEqual(getDefaultStats());
    });

    it('should calculate total return correctly', () => {
      const stats = calculateStats(mockEnhancedData);
      expect(stats.totalReturn).toBe(15);
    });

    it('should calculate max drawdown correctly', () => {
      const stats = calculateStats(mockEnhancedData);
      expect(stats.maxDrawdown).toBeCloseTo(-2.381, 2);
    });

    it('should calculate win rate correctly', () => {
      const stats = calculateStats(mockEnhancedData);
      // 3 positive returns out of 4 (excluding first day) = 75%
      expect(stats.winRate).toBe(75);
    });

    it('should calculate alpha correctly', () => {
      const stats = calculateStats(mockEnhancedData, 10);
      // alpha = 15 - 10 = 5
      expect(stats.alpha).toBe(5);
    });

    it('should use 0 for benchmark return when not provided', () => {
      const stats = calculateStats(mockEnhancedData);
      expect(stats.benchmarkReturn).toBe(0);
      expect(stats.alpha).toBe(15); // totalReturn - 0
    });

    it('should calculate volatility (annualized)', () => {
      const stats = calculateStats(mockEnhancedData);
      // Volatility should be positive
      expect(stats.volatility).toBeGreaterThan(0);
    });

    it('should calculate sharpe ratio', () => {
      const stats = calculateStats(mockEnhancedData);
      // Sharpe ratio with positive returns should be positive
      expect(stats.sharpe).toBeGreaterThan(0);
    });

    it('should handle zero volatility', () => {
      const flatData = [
        {
          day: 1,
          value: 1000,
          dailyReturn: 0,
          drawdown: 0,
          cumReturn: 0,
          benchmarkDrawdown: 0,
          normalizedPortfolio: 100,
          normalizedBenchmark: null,
        },
        {
          day: 2,
          value: 1000,
          dailyReturn: 0,
          drawdown: 0,
          cumReturn: 0,
          benchmarkDrawdown: 0,
          normalizedPortfolio: 100,
          normalizedBenchmark: null,
        },
      ];
      const stats = calculateStats(flatData);
      expect(stats.sharpe).toBe(0); // 0 volatility means sharpe is 0
    });

    it('should handle all negative returns', () => {
      const negativeData = [
        {
          day: 1,
          value: 1000,
          dailyReturn: 0,
          drawdown: 0,
          cumReturn: 0,
          benchmarkDrawdown: 0,
          normalizedPortfolio: 100,
          normalizedBenchmark: null,
        },
        {
          day: 2,
          value: 950,
          dailyReturn: -5,
          drawdown: -5,
          cumReturn: -5,
          benchmarkDrawdown: 0,
          normalizedPortfolio: 95,
          normalizedBenchmark: null,
        },
        {
          day: 3,
          value: 900,
          dailyReturn: -5.26,
          drawdown: -10,
          cumReturn: -10,
          benchmarkDrawdown: 0,
          normalizedPortfolio: 90,
          normalizedBenchmark: null,
        },
      ];
      const stats = calculateStats(negativeData);
      expect(stats.winRate).toBe(0); // No positive returns
      expect(stats.totalReturn).toBe(-10);
      expect(stats.maxDrawdown).toBe(-10);
    });

    it('should handle negative benchmark return', () => {
      const stats = calculateStats(mockEnhancedData, -5);
      expect(stats.benchmarkReturn).toBe(-5);
      expect(stats.alpha).toBe(20); // 15 - (-5) = 20
    });
  });
});
