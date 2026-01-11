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
const LabeledSelect: React.FC<{
  label: string;
  tooltip: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}> = ({ label, tooltip, value, onChange, options }) => (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
      {label}
      <InfoTooltip text={tooltip} />
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
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
  const handleChange = <K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-gray-100">설정</h2>
        <p className="text-sm text-gray-400">알파를 세밀하게 조정하세요.</p>
      </div>

      <Section title="3축 계획 (TAP)">
        <LabeledSelect
          label="아이디어 & 데이터셋"
          tooltip="알파의 핵심 개념과 사용 데이터입니다."
          value={config.idea}
          onChange={(e) => handleChange('idea', e.target.value)}
          options={[
            { value: 'Reversion', label: '평균회귀' },
            { value: 'Momentum', label: '모멘텀' },
            { value: 'Seasonality', label: '계절성' },
            { value: 'Value', label: '가치투자' },
            { value: 'ML_Signal', label: '머신러닝' },
          ]}
        />
        <LabeledSelect
          label="지역 & 유니버스"
          tooltip="알파가 적용될 지리적 시장과 자산 풀입니다."
          value={config.region}
          onChange={(e) => handleChange('region', e.target.value)}
          options={[
            { value: 'US', label: '미국' },
            { value: 'EU', label: '유럽' },
            { value: 'ASIA', label: '아시아' },
          ]}
        />
        <LabeledSelect
          label="성과 목표"
          tooltip="최적화할 주요 지표입니다."
          value={config.performanceGoal}
          onChange={(e) => handleChange('performanceGoal', e.target.value)}
          options={[
            { value: 'High_IR', label: '높은 정보비율' },
            { value: 'High_Return', label: '높은 수익률' },
            { value: 'Low_Drawdown', label: '낮은 낙폭' },
            { value: 'Low_Turnover', label: '낮은 턴오버' },
          ]}
        />
      </Section>

      <Section title="알파 파라미터">
        <LabeledSelect
          label="유니버스"
          tooltip={tooltips.universe}
          value={config.universe}
          onChange={(e) => handleChange('universe', e.target.value)}
          options={[
            { value: 'TOP_500', label: '상위 500' },
            { value: 'TOP_1000', label: '상위 1000' },
            { value: 'TOP_3000', label: '상위 3000' },
          ]}
        />
        <ParameterSlider
          label="지연 (일)"
          min={0}
          max={5}
          step={1}
          value={config.delay}
          onChange={(v) => handleChange('delay', v)}
          tooltip={tooltips.delay}
        />
        <ParameterSlider
          label="룩백 기간 (일)"
          min={5}
          max={252}
          step={1}
          value={config.lookbackDays}
          onChange={(v) => handleChange('lookbackDays', v)}
          tooltip={tooltips.lookbackDays}
        />
        <ParameterSlider
          label="최대 종목 비중 (%)"
          min={0.1}
          max={10}
          step={0.1}
          value={config.maxStockWeight}
          onChange={(v) => handleChange('maxStockWeight', v)}
          tooltip={tooltips.maxStockWeight}
        />
        <ParameterSlider
          label="감쇠 (일)"
          min={0}
          max={20}
          step={1}
          value={config.decay}
          onChange={(v) => handleChange('decay', v)}
          tooltip={tooltips.decay}
        />
      </Section>

      <Section title="리스크 & 중립화">
        <LabeledSelect
          label="중립화"
          tooltip={tooltips.neutralization}
          value={config.neutralization}
          onChange={(e) => handleChange('neutralization', e.target.value)}
          options={[
            { value: 'None', label: '없음' },
            { value: 'Market', label: '시장 중립' },
            { value: 'Industry', label: '산업 중립' },
            { value: 'Factor', label: '팩터 중립' },
          ]}
        />
      </Section>
    </div>
  );
};

export default ConfigPanel;
