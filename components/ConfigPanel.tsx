import React from 'react';
import type { Config } from '../types';
import { ParameterSlider } from './ParameterSlider';
import { InfoTooltip } from './InfoTooltip';
import { tooltips } from '../constants';

/**
 * Props for the ConfigPanel component
 */
interface ConfigPanelProps {
  /** Current configuration object */
  config: Config;
  /** Function to update the configuration */
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
}

/**
 * Section component for grouping related configuration options
 * @param title - The title of the section
 * @param children - The content of the section
 */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-4 border-b border-gray-800 last:border-b-0">
    <h3 className="text-sm font-semibold text-cyan-400 mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

/**
 * Labeled select input component with tooltip
 * @param label - The label text
 * @param tooltip - The tooltip text to display
 * @param value - The current selected value
 * @param onChange - Callback when the value changes
 * @param options - Array of option objects with value and label
 */
const LabeledSelect: React.FC<{ label: string; tooltip: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: {value: string; label: string}[] }> = ({ label, tooltip, value, onChange, options }) => (
    <div>
        <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
            {label}
            <InfoTooltip text={tooltip} />
        </label>
        <select value={value} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

/**
 * Configuration panel component for adjusting alpha strategy parameters
 * Displays various configuration options organized in sections:
 * - Triple-Axis Plan (TAP): Idea, Region, Performance Goal
 * - Alpha Parameters: Universe, Delay, Lookback, Max Stock Weight, Decay
 * - Risk & Neutralization: Neutralization method
 * 
 * @param config - Current configuration object
 * @param setConfig - Function to update the configuration
 */
export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig }) => {
  const handleChange = <K extends keyof Config,>(key: K, value: Config[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-gray-100">Configuration</h2>
        <p className="text-sm text-gray-400">Adjust parameters to refine your alpha.</p>
      </div>
      
      <Section title="Triple-Axis Plan (TAP)">
        <LabeledSelect 
            label="Idea & Dataset" 
            tooltip="The core concept and data used for the alpha."
            value={config.idea}
            onChange={(e) => handleChange('idea', e.target.value)}
            options={[
                { value: 'Reversion', label: 'Reversion' },
                { value: 'Momentum', label: 'Momentum' },
                { value: 'Seasonality', label: 'Seasonality' },
                { value: 'Value', label: 'Value' },
                { value: 'ML_Signal', label: 'Machine Learning' },
            ]}
        />
        <LabeledSelect 
            label="Region & Universe" 
            tooltip="Geographic market and asset pool for the alpha."
            value={config.region}
            onChange={(e) => handleChange('region', e.target.value)}
            options={[
                { value: 'US', label: 'United States' },
                { value: 'EU', label: 'Europe' },
                { value: 'ASIA', label: 'Asia' },
            ]}
        />
        <LabeledSelect 
            label="Performance Goal" 
            tooltip="The primary metric to optimize for."
            value={config.performanceGoal}
            onChange={(e) => handleChange('performanceGoal', e.target.value)}
            options={[
                { value: 'High_IR', label: 'High Information Ratio' },
                { value: 'High_Return', label: 'High Return' },
                { value: 'Low_Drawdown', label: 'Low Drawdown' },
                { value: 'Low_Turnover', label: 'Low Turnover' },
            ]}
        />
      </Section>
      
      <Section title="Alpha Parameters">
        <LabeledSelect 
            label="Universe" 
            tooltip={tooltips.universe}
            value={config.universe}
            onChange={(e) => handleChange('universe', e.target.value)}
            options={[
                { value: 'TOP_500', label: 'TOP 500' },
                { value: 'TOP_1000', label: 'TOP 1000' },
                { value: 'TOP_3000', label: 'TOP 3000' },
            ]}
        />
         <ParameterSlider
          label="Delay (days)"
          min={0}
          max={5}
          step={1}
          value={config.delay}
          onChange={(v) => handleChange('delay', v)}
          tooltip={tooltips.delay}
        />
        <ParameterSlider
          label="Lookback (days)"
          min={5}
          max={252}
          step={1}
          value={config.lookbackDays}
          onChange={(v) => handleChange('lookbackDays', v)}
          tooltip={tooltips.lookbackDays}
        />
        <ParameterSlider
          label="Max Stock Weight (%)"
          min={0.1}
          max={10}
          step={0.1}
          value={config.maxStockWeight}
          onChange={(v) => handleChange('maxStockWeight', v)}
          tooltip={tooltips.maxStockWeight}
        />
        <ParameterSlider
          label="Decay (days)"
          min={0}
          max={20}
          step={1}
          value={config.decay}
          onChange={(v) => handleChange('decay', v)}
          tooltip={tooltips.decay}
        />
      </Section>

      <Section title="Risk & Neutralization">
        <LabeledSelect 
            label="Neutralization" 
            tooltip={tooltips.neutralization}
            value={config.neutralization}
            onChange={(e) => handleChange('neutralization', e.target.value)}
            options={[
                { value: 'None', label: 'None' },
                { value: 'Market', label: 'Market Neutral' },
                { value: 'Industry', label: 'Industry Neutral' },
                { value: 'Factor', label: 'Factor Neutral' },
            ]}
        />
      </Section>
    </div>
  );
};
