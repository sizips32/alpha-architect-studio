/**
 * Chart formatter utilities for PerformanceChart
 * Extracted for testability
 */

/**
 * Format Y-axis tick value with locale string
 */
export const formatYAxis = (tick: number): string => {
  return tick.toLocaleString();
};

/**
 * Format value as percentage with 1 decimal place
 */
export const formatPercent = (tick: number): string => {
  return `${tick.toFixed(1)}%`;
};

/**
 * Format day label for tooltip
 */
export const formatDayLabel = (label: string | number): string => {
  return `Day ${label}`;
};

/**
 * Comparison view tooltip formatter
 * Formats normalized portfolio/benchmark values
 */
export const formatComparisonTooltip = (
  value: number,
  name: string,
  benchmarkName?: string
): [string, string] => {
  const label = name === 'normalizedPortfolio' ? '포트폴리오' : (benchmarkName ?? '벤치마크');
  return [`${(value - 100).toFixed(2)}%`, label];
};

/**
 * Comparison view legend formatter
 */
export const formatComparisonLegend = (value: string, benchmarkName?: string): string => {
  return value === 'normalizedPortfolio' ? '포트폴리오' : (benchmarkName ?? '벤치마크');
};

/**
 * Returns view tooltip formatter
 * Formats daily return percentage
 */
export const formatReturnsTooltip = (value: number): [string, string] => {
  return [`${value.toFixed(3)}%`, '일별 수익률'];
};

/**
 * Drawdown view tooltip formatter
 * Formats drawdown percentage with label
 */
export const formatDrawdownTooltip = (
  value: number,
  name: string,
  benchmarkName?: string
): [string, string] => {
  const label = name === 'drawdown' ? '포트폴리오' : (benchmarkName ?? '벤치마크');
  return [`${value.toFixed(2)}%`, `${label} 낙폭`];
};

/**
 * PnL view tooltip formatter result type
 */
export interface PnlTooltipResult {
  formattedValue: string;
  cumReturnText: string | null;
  cumReturnColor: string;
  label: string;
}

/**
 * PnL view tooltip formatter
 * Formats portfolio value with cumulative return
 */
export const formatPnlTooltip = (
  value: number,
  name: string,
  cumReturn?: number,
  benchmarkName?: string
): PnlTooltipResult => {
  if (name === 'benchmarkValue') {
    return {
      formattedValue: value.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      cumReturnText: null,
      cumReturnColor: '',
      label: benchmarkName ?? '벤치마크',
    };
  }

  const formattedValue = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  let cumReturnText: string | null = null;
  let cumReturnColor = '';

  if (cumReturn !== undefined) {
    const sign = cumReturn >= 0 ? '+' : '';
    cumReturnText = `(${sign}${cumReturn}%)`;
    cumReturnColor = cumReturn >= 0 ? '#4ade80' : '#f87171';
  }

  return {
    formattedValue,
    cumReturnText,
    cumReturnColor,
    label: '포트폴리오',
  };
};

/**
 * Statistics calculation types
 */
export interface ChartStats {
  totalReturn: number;
  maxDrawdown: number;
  avgDailyReturn: number;
  volatility: number;
  sharpe: number;
  winRate: number;
  alpha: number;
  benchmarkReturn: number;
}

/**
 * Enhanced data point type
 */
export interface EnhancedDataPoint {
  day: number;
  value: number;
  dailyReturn: number;
  drawdown: number;
  cumReturn: number;
  benchmarkValue?: number;
  benchmarkDrawdown: number;
  normalizedPortfolio: number;
  normalizedBenchmark: number | null;
}

/**
 * Default stats when no data
 */
export const getDefaultStats = (): ChartStats => ({
  totalReturn: 0,
  maxDrawdown: 0,
  avgDailyReturn: 0,
  volatility: 0,
  sharpe: 0,
  winRate: 0,
  alpha: 0,
  benchmarkReturn: 0,
});

/**
 * Calculate statistics from enhanced data
 */
export const calculateStats = (
  enhancedData: EnhancedDataPoint[],
  benchmarkReturn?: number
): ChartStats => {
  if (!enhancedData || enhancedData.length === 0) {
    return getDefaultStats();
  }

  const returns = enhancedData.map((d) => d.dailyReturn).filter((_, i) => i > 0);
  const totalReturn = enhancedData[enhancedData.length - 1].cumReturn;
  const maxDrawdown = Math.min(...enhancedData.map((d) => d.drawdown));
  const avgDailyReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - avgDailyReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized
  const sharpe = volatility > 0 ? (avgDailyReturn * 252) / volatility : 0;
  const winRate = (returns.filter((r) => r > 0).length / returns.length) * 100;

  // Benchmark comparison
  const benchReturn = benchmarkReturn ?? 0;
  const alpha = totalReturn - benchReturn;

  return {
    totalReturn,
    maxDrawdown,
    avgDailyReturn,
    volatility,
    sharpe,
    winRate,
    alpha,
    benchmarkReturn: benchReturn,
  };
};

/**
 * Calculate enhanced data from raw PnL data
 */
export const calculateEnhancedData = (
  data: { day: number; value: number }[],
  benchmarkData?: { day: number; value: number }[]
): EnhancedDataPoint[] => {
  if (!data || data.length === 0) return [];

  let peak = data[0].value;
  let benchmarkPeak = benchmarkData?.[0]?.value ?? data[0].value;

  return data.map((point, index) => {
    const prevValue = index > 0 ? data[index - 1].value : point.value;
    const dailyReturn = index > 0 ? ((point.value - prevValue) / prevValue) * 100 : 0;

    // Update peak for drawdown calculation
    if (point.value > peak) {
      peak = point.value;
    }
    const drawdown = ((point.value - peak) / peak) * 100;

    // Benchmark data
    const benchmarkValue = benchmarkData?.[index]?.value;
    let benchmarkDrawdown = 0;
    if (benchmarkValue) {
      if (benchmarkValue > benchmarkPeak) {
        benchmarkPeak = benchmarkValue;
      }
      benchmarkDrawdown = ((benchmarkValue - benchmarkPeak) / benchmarkPeak) * 100;
    }

    // Normalized values for comparison (base 100)
    const normalizedPortfolio = (point.value / data[0].value) * 100;
    const normalizedBenchmark =
      benchmarkValue && benchmarkData ? (benchmarkValue / benchmarkData[0].value) * 100 : null;

    return {
      ...point,
      dailyReturn: Number(dailyReturn.toFixed(3)),
      drawdown: Number(drawdown.toFixed(3)),
      cumReturn: Number((((point.value - data[0].value) / data[0].value) * 100).toFixed(2)),
      benchmarkValue,
      benchmarkDrawdown: Number(benchmarkDrawdown.toFixed(3)),
      normalizedPortfolio: Number(normalizedPortfolio.toFixed(2)),
      normalizedBenchmark: normalizedBenchmark ? Number(normalizedBenchmark.toFixed(2)) : null,
    };
  });
};
