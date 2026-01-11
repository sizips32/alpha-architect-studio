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
});
