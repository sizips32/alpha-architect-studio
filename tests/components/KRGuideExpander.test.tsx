import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KRGuideExpander } from '../../components/KRGuideExpander';

describe('KRGuideExpander', () => {
  const defaultProps = {
    onApplyPreset: vi.fn(),
    onRun: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the toggle button', () => {
    render(<KRGuideExpander {...defaultProps} />);

    expect(screen.getByText('한글 사용 가이드')).toBeDefined();
  });

  it('should render the subtitle', () => {
    render(<KRGuideExpander {...defaultProps} />);

    expect(screen.getByText(/클릭하여 열고 닫기/)).toBeDefined();
  });

  it('should be collapsed by default', () => {
    render(<KRGuideExpander {...defaultProps} />);

    // Content should not be visible
    expect(screen.queryByText('1) 목적')).toBeNull();
  });

  it('should expand when toggle button is clicked', () => {
    render(<KRGuideExpander {...defaultProps} />);

    const toggleButton = screen.getByRole('button', { expanded: false });
    fireEvent.click(toggleButton);

    expect(screen.getByText('1) 목적')).toBeDefined();
  });

  it('should collapse when toggle button is clicked twice', () => {
    render(<KRGuideExpander {...defaultProps} />);

    const toggleButton = screen.getByRole('button');

    // Expand
    fireEvent.click(toggleButton);
    expect(screen.getByText('1) 목적')).toBeDefined();

    // Collapse
    fireEvent.click(toggleButton);
    expect(screen.queryByText('1) 목적')).toBeNull();
  });

  it('should display all sections when expanded', () => {
    render(<KRGuideExpander {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(screen.getByText('1) 목적')).toBeDefined();
    expect(screen.getByText('2) 실시간/과거 데이터')).toBeDefined();
    expect(screen.getByText('3) 기본 워크플로우')).toBeDefined();
    expect(screen.getByText('4) 참고 팁')).toBeDefined();
    expect(screen.getByText('5) 예시 명령어(초급/중급/고급)')).toBeDefined();
  });

  it('should render preset buttons when expanded', () => {
    render(<KRGuideExpander {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(screen.getByText(/모멘텀 기본/)).toBeDefined();
    expect(screen.getByText(/단기 과매수 회피/)).toBeDefined();
    expect(screen.getByText(/밸류\+퀄리티 혼합/)).toBeDefined();
  });

  it('should call onApplyPreset and onRun when preset button is clicked', () => {
    render(<KRGuideExpander {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    const presetButton = screen.getByText(/모멘텀 기본/);
    fireEvent.click(presetButton);

    expect(defaultProps.onApplyPreset).toHaveBeenCalledWith(
      'rank(close / delay(close, 20)) - rank(volume)'
    );
    expect(defaultProps.onRun).toHaveBeenCalledWith(
      'rank(close / delay(close, 20)) - rank(volume)'
    );
  });

  it('should apply 단기 과매수 회피 preset correctly', () => {
    render(<KRGuideExpander {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/단기 과매수 회피/));

    expect(defaultProps.onApplyPreset).toHaveBeenCalledWith(
      'rank(returns, 20) - Ts_rank(volume, 5)'
    );
    expect(defaultProps.onRun).toHaveBeenCalledWith('rank(returns, 20) - Ts_rank(volume, 5)');
  });

  it('should apply 밸류+퀄리티 혼합 preset correctly', () => {
    render(<KRGuideExpander {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/밸류\+퀄리티 혼합/));

    expect(defaultProps.onApplyPreset).toHaveBeenCalledWith('z(revenue) + z(ebitda) + z(1/price)');
    expect(defaultProps.onRun).toHaveBeenCalledWith('z(revenue) + z(ebitda) + z(1/price)');
  });

  it('should apply 기본 예시 preset correctly', () => {
    render(<KRGuideExpander {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/기본 예시:/));

    expect(defaultProps.onApplyPreset).toHaveBeenCalledWith('rank(close) - rank(volume)');
    expect(defaultProps.onRun).toHaveBeenCalledWith('rank(close) - rank(volume)');
  });

  it('should apply 설명용 예시 preset correctly', () => {
    render(<KRGuideExpander {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/설명용 예시:/));

    expect(defaultProps.onApplyPreset).toHaveBeenCalledWith(
      'Ts_rank(close/delay(close,1), 10) - Ts_rank(volume, 10)'
    );
    expect(defaultProps.onRun).toHaveBeenCalledWith(
      'Ts_rank(close/delay(close,1), 10) - Ts_rank(volume, 10)'
    );
  });

  it('should apply 모멘텀×변동성 preset correctly', () => {
    render(<KRGuideExpander {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/모멘텀×변동성/));

    expect(defaultProps.onApplyPreset).toHaveBeenCalledWith(
      'rank(close / delay(close, 60)) / (1 + stddev(returns, 20))'
    );
    expect(defaultProps.onRun).toHaveBeenCalledWith(
      'rank(close / delay(close, 60)) / (1 + stddev(returns, 20))'
    );
  });

  it('should apply 밸류-볼 감쇠 preset correctly', () => {
    render(<KRGuideExpander {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/밸류-볼 감쇠/));

    expect(defaultProps.onApplyPreset).toHaveBeenCalledWith(
      'rank(1/price) + z(revenue) - z(stddev(returns, 60))'
    );
    expect(defaultProps.onRun).toHaveBeenCalledWith(
      'rank(1/price) + z(revenue) - z(stddev(returns, 60))'
    );
  });

  it('should apply 수급·리스크 혼합 preset correctly', () => {
    render(<KRGuideExpander {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/수급·리스크 혼합/));

    expect(defaultProps.onApplyPreset).toHaveBeenCalledWith(
      'correlation(returns, volume, 20) - Ts_rank(stddev(returns, 20), 60)'
    );
    expect(defaultProps.onRun).toHaveBeenCalledWith(
      'correlation(returns, volume, 20) - Ts_rank(stddev(returns, 20), 60)'
    );
  });

  it('should apply IC 예측용 피처 예시 preset correctly', () => {
    render(<KRGuideExpander {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/IC 예측용 피처 예시/));

    expect(defaultProps.onApplyPreset).toHaveBeenCalledWith(
      'rank(returns, 60) - rank(stddev(returns, 20))'
    );
    expect(defaultProps.onRun).toHaveBeenCalledWith(
      'rank(returns, 60) - rank(stddev(returns, 20))'
    );
  });

  it('should apply 소프트맥스 가중 컨셉 preset correctly', () => {
    render(<KRGuideExpander {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/소프트맥스 가중 컨셉/));

    expect(defaultProps.onApplyPreset).toHaveBeenCalledWith(
      'softmax(rank(returns,20), tau=0.5) / vol'
    );
    expect(defaultProps.onRun).toHaveBeenCalledWith('softmax(rank(returns,20), tau=0.5) / vol');
  });

  it('should render intermediate level presets', () => {
    render(<KRGuideExpander {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(screen.getByText('중급(3)')).toBeDefined();
    expect(screen.getByText(/모멘텀×변동성/)).toBeDefined();
  });

  it('should render advanced level presets', () => {
    render(<KRGuideExpander {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(screen.getByText('고급(2)')).toBeDefined();
    expect(screen.getByText(/IC 예측용 피처 예시/)).toBeDefined();
  });

  it('should render MCP code example', () => {
    render(<KRGuideExpander {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(screen.getByText(/MCP 사용 환경이라면/)).toBeDefined();
    expect(screen.getByText(/fetch_historical_data/)).toBeDefined();
  });

  it('should work without callbacks', () => {
    render(<KRGuideExpander />);

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    const presetButton = screen.getByText(/모멘텀 기본/);
    // Should not throw when clicking without callbacks
    expect(() => fireEvent.click(presetButton)).not.toThrow();
  });

  it('should have aria-expanded attribute', () => {
    render(<KRGuideExpander {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(toggleButton);
    expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
  });
});
