import React, { useMemo, useState } from 'react';
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
} from '../utils/chartFormatters';

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
    return calculateEnhancedData(data, benchmark?.data);
  }, [data, benchmark]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateStats(enhancedData, benchmark?.return);
  }, [enhancedData, benchmark]);

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
                formatter={(value: number, name: string) =>
                  formatComparisonTooltip(value, name, benchmark?.name)
                }
                labelFormatter={formatDayLabel}
              />
              <Legend formatter={(value) => formatComparisonLegend(value, benchmark?.name)} />
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
                formatter={(value: number) => formatReturnsTooltip(value)}
                labelFormatter={formatDayLabel}
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
                formatter={(value: number, name: string) =>
                  formatDrawdownTooltip(value, name, benchmark?.name)
                }
                labelFormatter={formatDayLabel}
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
                  const result = formatPnlTooltip(
                    value,
                    name,
                    props.payload?.cumReturn,
                    benchmark?.name
                  );
                  if (name === 'benchmarkValue') {
                    return [result.formattedValue, result.label];
                  }
                  return [
                    <span key="value">
                      {result.formattedValue}
                      {result.cumReturnText && (
                        <span style={{ marginLeft: '8px', color: result.cumReturnColor }}>
                          {result.cumReturnText}
                        </span>
                      )}
                    </span>,
                    result.label,
                  ];
                }}
                labelFormatter={formatDayLabel}
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
