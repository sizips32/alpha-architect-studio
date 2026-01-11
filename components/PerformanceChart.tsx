import React, { useMemo, useCallback, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ReferenceLine,
  Legend,
  Line,
  LineChart,
} from 'recharts';
import type { PnlDataPoint, BenchmarkData } from '../types';

/**
 * Props for the PerformanceChart component
 */
interface PerformanceChartProps {
  /** Array of PnL data points to display */
  data: PnlDataPoint[];
  /** Optional benchmark data for comparison */
  benchmark?: BenchmarkData;
}

type ChartView = 'pnl' | 'returns' | 'drawdown' | 'comparison';

/**
 * Enhanced Performance chart component displaying portfolio PnL over time
 * Includes multiple views: PnL, Daily Returns, Drawdown, and Benchmark Comparison
 */
export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, benchmark }) => {
  const [activeView, setActiveView] = useState<ChartView>('pnl');
  const [showBenchmark, setShowBenchmark] = useState(true);

  // Calculate enhanced data with returns and drawdown
  const enhancedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let peak = data[0].value;
    let benchmarkPeak = benchmark?.data[0]?.value ?? data[0].value;

    return data.map((point, index) => {
      const prevValue = index > 0 ? data[index - 1].value : point.value;
      const dailyReturn = index > 0 ? ((point.value - prevValue) / prevValue) * 100 : 0;

      // Update peak for drawdown calculation
      if (point.value > peak) {
        peak = point.value;
      }
      const drawdown = ((point.value - peak) / peak) * 100;

      // Benchmark data
      const benchmarkValue = benchmark?.data[index]?.value;
      let benchmarkDrawdown = 0;
      if (benchmarkValue) {
        if (benchmarkValue > benchmarkPeak) {
          benchmarkPeak = benchmarkValue;
        }
        benchmarkDrawdown = ((benchmarkValue - benchmarkPeak) / benchmarkPeak) * 100;
      }

      // Normalized values for comparison (base 100)
      const normalizedPortfolio = (point.value / data[0].value) * 100;
      const normalizedBenchmark = benchmarkValue
        ? (benchmarkValue / benchmark!.data[0].value) * 100
        : null;

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
  }, [data, benchmark]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!enhancedData || enhancedData.length === 0) {
      return {
        totalReturn: 0,
        maxDrawdown: 0,
        avgDailyReturn: 0,
        volatility: 0,
        sharpe: 0,
        winRate: 0,
        alpha: 0,
        benchmarkReturn: 0,
      };
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
    const benchmarkReturn = benchmark?.return ?? 0;
    const alpha = totalReturn - benchmarkReturn;

    return {
      totalReturn,
      maxDrawdown,
      avgDailyReturn,
      volatility,
      sharpe,
      winRate,
      alpha,
      benchmarkReturn,
    };
  }, [enhancedData, benchmark]);

  const formatYAxis = useCallback((tick: number) => {
    return tick.toLocaleString();
  }, []);

  const formatPercent = useCallback((tick: number) => {
    return `${tick.toFixed(1)}%`;
  }, []);

  const views: { id: ChartView; label: string }[] = [
    { id: 'pnl', label: 'PnL' },
    { id: 'comparison', label: '벤치마크 비교' },
    { id: 'returns', label: '일별 수익률' },
    { id: 'drawdown', label: '낙폭' },
  ];

  const renderChart = () => {
    switch (activeView) {
      case 'comparison':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={enhancedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
                width={50}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <ReferenceLine y={100} stroke="#64748b" strokeDasharray="3 3" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#cbd5e1' }}
                formatter={(value: number, name: string) => {
                  const label =
                    name === 'normalizedPortfolio' ? '포트폴리오' : (benchmark?.name ?? '벤치마크');
                  return [`${(value - 100).toFixed(2)}%`, label];
                }}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Legend
                formatter={(value) =>
                  value === 'normalizedPortfolio' ? '포트폴리오' : (benchmark?.name ?? '벤치마크')
                }
              />
              <Line
                type="monotone"
                dataKey="normalizedPortfolio"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
                name="normalizedPortfolio"
              />
              {benchmark && (
                <Line
                  type="monotone"
                  dataKey="normalizedBenchmark"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  name="normalizedBenchmark"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'returns':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={enhancedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPercent}
                width={60}
              />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#cbd5e1' }}
                formatter={(value: number) => [`${value.toFixed(3)}%`, '일별 수익률']}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Bar
                dataKey="dailyReturn"
                fill="#22d3ee"
                stroke="none"
                radius={[2, 2, 0, 0]}
                barSize={4}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'drawdown':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={enhancedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBenchmarkDrawdown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPercent}
                width={60}
                domain={['dataMin', 0]}
              />
              <ReferenceLine y={0} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#cbd5e1' }}
                formatter={(value: number, name: string) => {
                  const label =
                    name === 'drawdown' ? '포트폴리오' : (benchmark?.name ?? '벤치마크');
                  return [`${value.toFixed(2)}%`, `${label} 낙폭`];
                }}
                labelFormatter={(label) => `Day ${label}`}
              />
              {benchmark && showBenchmark && (
                <Area
                  type="monotone"
                  dataKey="benchmarkDrawdown"
                  stroke="#f59e0b"
                  strokeWidth={1}
                  fillOpacity={1}
                  fill="url(#colorBenchmarkDrawdown)"
                />
              )}
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDrawdown)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={enhancedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
                domain={['dataMin', 'dataMax']}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#cbd5e1' }}
                formatter={(
                  value: number,
                  name: string,
                  props: { payload?: { cumReturn?: number; benchmarkValue?: number } }
                ) => {
                  if (name === 'benchmarkValue') {
                    return [
                      value.toLocaleString(undefined, { maximumFractionDigits: 2 }),
                      benchmark?.name ?? '벤치마크',
                    ];
                  }
                  const cumReturn = props.payload?.cumReturn;
                  return [
                    <span key="value">
                      {value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {cumReturn !== undefined && (
                        <span
                          style={{
                            marginLeft: '8px',
                            color: cumReturn >= 0 ? '#4ade80' : '#f87171',
                          }}
                        >
                          ({cumReturn >= 0 ? '+' : ''}
                          {cumReturn}%)
                        </span>
                      )}
                    </span>,
                    '포트폴리오',
                  ];
                }}
                labelFormatter={(label) => `Day ${label}`}
              />
              {benchmark && showBenchmark && (
                <Line
                  type="monotone"
                  dataKey="benchmarkValue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22d3ee"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-center">
        <div className="bg-gray-800/50 rounded-lg p-2">
          <div className="text-xs text-gray-500">총 수익률</div>
          <div
            className={`text-sm font-bold ${stats.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            {stats.totalReturn >= 0 ? '+' : ''}
            {stats.totalReturn.toFixed(2)}%
          </div>
        </div>
        {benchmark && (
          <div className="bg-gray-800/50 rounded-lg p-2">
            <div className="text-xs text-gray-500">{benchmark.name}</div>
            <div
              className={`text-sm font-bold ${stats.benchmarkReturn >= 0 ? 'text-amber-400' : 'text-red-400'}`}
            >
              {stats.benchmarkReturn >= 0 ? '+' : ''}
              {stats.benchmarkReturn.toFixed(2)}%
            </div>
          </div>
        )}
        {benchmark && (
          <div className="bg-gray-800/50 rounded-lg p-2">
            <div className="text-xs text-gray-500">알파</div>
            <div
              className={`text-sm font-bold ${stats.alpha >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {stats.alpha >= 0 ? '+' : ''}
              {stats.alpha.toFixed(2)}%
            </div>
          </div>
        )}
        <div className="bg-gray-800/50 rounded-lg p-2">
          <div className="text-xs text-gray-500">최대 낙폭</div>
          <div className="text-sm font-bold text-red-400">{stats.maxDrawdown.toFixed(2)}%</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2">
          <div className="text-xs text-gray-500">변동성</div>
          <div className="text-sm font-bold text-white">{stats.volatility.toFixed(2)}%</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2">
          <div className="text-xs text-gray-500">샤프비율</div>
          <div className="text-sm font-bold text-cyan-400">{stats.sharpe.toFixed(2)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2">
          <div className="text-xs text-gray-500">승률</div>
          <div className="text-sm font-bold text-white">{stats.winRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Chart View Tabs & Benchmark Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeView === view.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
        {benchmark && activeView !== 'comparison' && activeView !== 'returns' && (
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showBenchmark}
              onChange={(e) => setShowBenchmark(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-0.5"
                style={{ backgroundColor: '#f59e0b', borderStyle: 'dashed' }}
              />
              {benchmark.name} 표시
            </span>
          </label>
        )}
      </div>

      {/* Chart */}
      <div className="h-64">{renderChart()}</div>
    </div>
  );
};
