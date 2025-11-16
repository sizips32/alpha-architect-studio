import React, { memo } from 'react';
import { InfoTooltip } from './InfoTooltip';

/**
 * Props for the KpiCard component
 */
interface KpiCardProps {
  /** The title/label of the KPI */
  title: string;
  /** The value to display (can be string or number) */
  value: string | number;
  /** Tooltip text explaining the KPI */
  tooltip: string;
  /** Whether the value is positive (green) or negative (red). Undefined for neutral. */
  isPositive?: boolean;
}

/**
 * KPI card component for displaying a single key performance indicator
 * Shows title, value, and an info tooltip
 * Memoized to prevent unnecessary re-renders
 * 
 * @param title - KPI title
 * @param value - KPI value to display
 * @param tooltip - Tooltip explanation
 * @param isPositive - Color coding (true = green, false = red, undefined = neutral)
 */
export const KpiCard: React.FC<KpiCardProps> = memo(({ title, value, tooltip, isPositive }) => {
  const valueColor = isPositive === true ? 'text-green-400' : isPositive === false ? 'text-red-400' : 'text-gray-100';

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
      <div className="flex items-center text-sm font-medium text-gray-400 mb-1">
        <span>{title}</span>
        <InfoTooltip text={tooltip} />
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
});

KpiCard.displayName = 'KpiCard';
