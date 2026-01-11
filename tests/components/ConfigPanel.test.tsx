import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigPanel } from '../../components/ConfigPanel';
import type { Config } from '../../types';

describe('ConfigPanel', () => {
  const defaultConfig: Config = {
    universe: 'TOP_3000',
    delay: 1,
    lookbackDays: 60,
    maxStockWeight: 0.02,
    decay: 0.5,
    neutralization: 'Market',
    idea: 'Momentum',
    region: 'US',
    performanceGoal: 'High_IR',
  };

  const mockSetConfig = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the panel title', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    expect(screen.getByText('설정')).toBeDefined();
  });

  it('should render the panel description', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    expect(screen.getByText('알파를 세밀하게 조정하세요.')).toBeDefined();
  });

  it('should render section titles', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    expect(screen.getByText('3축 계획 (TAP)')).toBeDefined();
    expect(screen.getByText('알파 파라미터')).toBeDefined();
    expect(screen.getByText('리스크 & 중립화')).toBeDefined();
  });

  it('should render idea selector with correct options', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    expect(screen.getByText('아이디어 & 데이터셋')).toBeDefined();
    expect(screen.getByText('평균회귀')).toBeDefined();
    expect(screen.getByText('모멘텀')).toBeDefined();
    expect(screen.getByText('계절성')).toBeDefined();
    expect(screen.getByText('가치투자')).toBeDefined();
    expect(screen.getByText('머신러닝')).toBeDefined();
  });

  it('should render region selector with correct options', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    expect(screen.getByText('지역 & 유니버스')).toBeDefined();
    expect(screen.getByText('미국')).toBeDefined();
    expect(screen.getByText('유럽')).toBeDefined();
    expect(screen.getByText('아시아')).toBeDefined();
  });

  it('should render performance goal selector with correct options', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    expect(screen.getByText('성과 목표')).toBeDefined();
    expect(screen.getByText('높은 정보비율')).toBeDefined();
    expect(screen.getByText('높은 수익률')).toBeDefined();
    expect(screen.getByText('낮은 낙폭')).toBeDefined();
    expect(screen.getByText('낮은 턴오버')).toBeDefined();
  });

  it('should render universe selector', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    expect(screen.getByText('유니버스')).toBeDefined();
    expect(screen.getByText('상위 500')).toBeDefined();
    expect(screen.getByText('상위 1000')).toBeDefined();
    expect(screen.getByText('상위 3000')).toBeDefined();
  });

  it('should render neutralization selector', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    expect(screen.getByText('중립화')).toBeDefined();
    expect(screen.getByText('없음')).toBeDefined();
    expect(screen.getByText('시장 중립')).toBeDefined();
    expect(screen.getByText('산업 중립')).toBeDefined();
    expect(screen.getByText('팩터 중립')).toBeDefined();
  });

  it('should render parameter sliders', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    expect(screen.getByText('지연 (일)')).toBeDefined();
    expect(screen.getByText('룩백 기간 (일)')).toBeDefined();
    expect(screen.getByText('최대 종목 비중 (%)')).toBeDefined();
    expect(screen.getByText('감쇠 (일)')).toBeDefined();
  });

  it('should call setConfig when idea is changed', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    const selects = screen.getAllByRole('combobox');
    const ideaSelect = selects[0]; // First select is idea

    fireEvent.change(ideaSelect, { target: { value: 'Reversion' } });

    expect(mockSetConfig).toHaveBeenCalled();
  });

  it('should call setConfig when region is changed', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    const selects = screen.getAllByRole('combobox');
    const regionSelect = selects[1]; // Second select is region

    fireEvent.change(regionSelect, { target: { value: 'EU' } });

    expect(mockSetConfig).toHaveBeenCalled();
  });

  it('should call setConfig when universe is changed', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    const selects = screen.getAllByRole('combobox');
    const universeSelect = selects[3]; // Fourth select is universe

    fireEvent.change(universeSelect, { target: { value: 'TOP_500' } });

    expect(mockSetConfig).toHaveBeenCalled();
  });

  it('should call setConfig when neutralization is changed', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    const selects = screen.getAllByRole('combobox');
    const neutralizationSelect = selects[4]; // Fifth select is neutralization

    fireEvent.change(neutralizationSelect, { target: { value: 'Industry' } });

    expect(mockSetConfig).toHaveBeenCalled();
  });

  it('should call setConfig when slider value is changed', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    const sliders = screen.getAllByRole('slider');
    const delaySlider = sliders[0]; // First slider is delay

    fireEvent.change(delaySlider, { target: { value: '3' } });

    expect(mockSetConfig).toHaveBeenCalled();
  });

  it('should render with current config values', () => {
    const customConfig: Config = {
      ...defaultConfig,
      delay: 3,
      lookbackDays: 120,
    };

    render(<ConfigPanel config={customConfig} setConfig={mockSetConfig} />);

    const sliders = screen.getAllByRole('slider') as HTMLInputElement[];
    expect(sliders[0].value).toBe('3'); // delay
    expect(sliders[1].value).toBe('120'); // lookbackDays
  });

  it('should have correct number of select elements', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(5); // idea, region, performanceGoal, universe, neutralization
  });

  it('should have correct number of slider elements', () => {
    render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBe(4); // delay, lookbackDays, maxStockWeight, decay
  });

  // Additional tests for complete coverage
  describe('select onChange handlers', () => {
    it('should call setConfig when performanceGoal is changed', () => {
      render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

      const selects = screen.getAllByRole('combobox');
      const performanceGoalSelect = selects[2]; // Third select is performanceGoal

      fireEvent.change(performanceGoalSelect, { target: { value: 'High_Return' } });

      expect(mockSetConfig).toHaveBeenCalled();
      // Verify the callback was called with a function
      const callback = mockSetConfig.mock.calls[0][0];
      expect(typeof callback).toBe('function');
      // Execute the callback to verify it updates correctly
      const result = callback(defaultConfig);
      expect(result.performanceGoal).toBe('High_Return');
    });

    it('should update idea correctly', () => {
      render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'Value' } });

      const callback = mockSetConfig.mock.calls[0][0];
      const result = callback(defaultConfig);
      expect(result.idea).toBe('Value');
    });

    it('should update region correctly', () => {
      render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[1], { target: { value: 'ASIA' } });

      const callback = mockSetConfig.mock.calls[0][0];
      const result = callback(defaultConfig);
      expect(result.region).toBe('ASIA');
    });

    it('should update universe correctly', () => {
      render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[3], { target: { value: 'TOP_1000' } });

      const callback = mockSetConfig.mock.calls[0][0];
      const result = callback(defaultConfig);
      expect(result.universe).toBe('TOP_1000');
    });

    it('should update neutralization correctly', () => {
      render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[4], { target: { value: 'Factor' } });

      const callback = mockSetConfig.mock.calls[0][0];
      const result = callback(defaultConfig);
      expect(result.neutralization).toBe('Factor');
    });
  });

  describe('slider onChange handlers', () => {
    it('should call setConfig when lookbackDays slider is changed', () => {
      render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

      const sliders = screen.getAllByRole('slider');
      const lookbackSlider = sliders[1]; // Second slider is lookbackDays

      fireEvent.change(lookbackSlider, { target: { value: '120' } });

      expect(mockSetConfig).toHaveBeenCalled();
      const callback = mockSetConfig.mock.calls[0][0];
      const result = callback(defaultConfig);
      expect(result.lookbackDays).toBe(120);
    });

    it('should call setConfig when maxStockWeight slider is changed', () => {
      render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

      const sliders = screen.getAllByRole('slider');
      const maxWeightSlider = sliders[2]; // Third slider is maxStockWeight

      fireEvent.change(maxWeightSlider, { target: { value: '5' } });

      expect(mockSetConfig).toHaveBeenCalled();
      const callback = mockSetConfig.mock.calls[0][0];
      const result = callback(defaultConfig);
      expect(result.maxStockWeight).toBe(5);
    });

    it('should call setConfig when decay slider is changed', () => {
      render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

      const sliders = screen.getAllByRole('slider');
      const decaySlider = sliders[3]; // Fourth slider is decay

      fireEvent.change(decaySlider, { target: { value: '10' } });

      expect(mockSetConfig).toHaveBeenCalled();
      const callback = mockSetConfig.mock.calls[0][0];
      const result = callback(defaultConfig);
      expect(result.decay).toBe(10);
    });

    it('should update delay correctly', () => {
      render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

      const sliders = screen.getAllByRole('slider');
      fireEvent.change(sliders[0], { target: { value: '5' } });

      const callback = mockSetConfig.mock.calls[0][0];
      const result = callback(defaultConfig);
      expect(result.delay).toBe(5);
    });
  });

  describe('config value preservation', () => {
    it('should preserve other config values when updating one field', () => {
      render(<ConfigPanel config={defaultConfig} setConfig={mockSetConfig} />);

      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'Seasonality' } });

      const callback = mockSetConfig.mock.calls[0][0];
      const result = callback(defaultConfig);

      // Verify the changed value
      expect(result.idea).toBe('Seasonality');
      // Verify other values are preserved
      expect(result.universe).toBe(defaultConfig.universe);
      expect(result.delay).toBe(defaultConfig.delay);
      expect(result.lookbackDays).toBe(defaultConfig.lookbackDays);
      expect(result.maxStockWeight).toBe(defaultConfig.maxStockWeight);
      expect(result.decay).toBe(defaultConfig.decay);
      expect(result.neutralization).toBe(defaultConfig.neutralization);
      expect(result.region).toBe(defaultConfig.region);
      expect(result.performanceGoal).toBe(defaultConfig.performanceGoal);
    });
  });

  describe('different config values', () => {
    it('should render with different idea value', () => {
      const customConfig: Config = { ...defaultConfig, idea: 'Reversion' };
      render(<ConfigPanel config={customConfig} setConfig={mockSetConfig} />);

      const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
      expect(selects[0].value).toBe('Reversion');
    });

    it('should render with different region value', () => {
      const customConfig: Config = { ...defaultConfig, region: 'EU' };
      render(<ConfigPanel config={customConfig} setConfig={mockSetConfig} />);

      const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
      expect(selects[1].value).toBe('EU');
    });

    it('should render with different performanceGoal value', () => {
      const customConfig: Config = { ...defaultConfig, performanceGoal: 'Low_Drawdown' };
      render(<ConfigPanel config={customConfig} setConfig={mockSetConfig} />);

      const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
      expect(selects[2].value).toBe('Low_Drawdown');
    });

    it('should render with different universe value', () => {
      const customConfig: Config = { ...defaultConfig, universe: 'TOP_500' };
      render(<ConfigPanel config={customConfig} setConfig={mockSetConfig} />);

      const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
      expect(selects[3].value).toBe('TOP_500');
    });

    it('should render with different neutralization value', () => {
      const customConfig: Config = { ...defaultConfig, neutralization: 'None' };
      render(<ConfigPanel config={customConfig} setConfig={mockSetConfig} />);

      const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
      expect(selects[4].value).toBe('None');
    });

    it('should render with different maxStockWeight value', () => {
      const customConfig: Config = { ...defaultConfig, maxStockWeight: 5 };
      render(<ConfigPanel config={customConfig} setConfig={mockSetConfig} />);

      const sliders = screen.getAllByRole('slider') as HTMLInputElement[];
      expect(sliders[2].value).toBe('5'); // maxStockWeight
    });

    it('should render with different decay value', () => {
      const customConfig: Config = { ...defaultConfig, decay: 15 };
      render(<ConfigPanel config={customConfig} setConfig={mockSetConfig} />);

      const sliders = screen.getAllByRole('slider') as HTMLInputElement[];
      expect(sliders[3].value).toBe('15'); // decay
    });
  });
});
