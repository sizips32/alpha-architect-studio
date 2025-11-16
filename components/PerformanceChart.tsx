
import React, { useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Defs, Gradient } from 'recharts';
import type { PnlDataPoint } from '../types';

/**
 * Props for the PerformanceChart component
 */
interface PerformanceChartProps {
  /** Array of PnL data points to display */
  data: PnlDataPoint[];
}

/**
 * Performance chart component displaying portfolio PnL over time
 * Uses Recharts AreaChart with gradient fill and responsive design
 * 
 * @param data - Array of PnL data points with day and value
 */
export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  // Memoize formatter to prevent recreation on each render
  const formatYAxis = useCallback((tick: number) => {
    return tick.toLocaleString();
  }, []);

  // Memoize tooltip formatter
  const formatTooltip = useCallback((value: number) => {
    return [value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), 'PnL'];
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: 10,
          bottom: 5,
        }}
      >
        <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
            </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
            dataKey="day" 
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Trading Days', position: 'insideBottom', offset: -15, fill: '#94a3b8', fontSize: 12 }}
        />
        <YAxis 
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
            domain={['dataMin', 'dataMax']}
            width={80}
            label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12, dx: -20 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            borderColor: '#334155',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#cbd5e1' }}
          itemStyle={{ color: '#22d3ee' }}
          formatter={formatTooltip}
        />
        <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};
