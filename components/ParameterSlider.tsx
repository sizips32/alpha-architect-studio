import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface ParameterSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  tooltip: string;
}

export const ParameterSlider: React.FC<ParameterSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  tooltip,
}) => {
  return (
    <div>
      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
        {label}
        <InfoTooltip text={tooltip} />
      </label>
      <div className="flex items-center space-x-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <span className="text-sm text-gray-200 font-mono w-16 text-right bg-gray-800 px-2 py-1 rounded-md">
          {value.toFixed(step < 1 ? 1 : 0)}
        </span>
      </div>
    </div>
  );
};
