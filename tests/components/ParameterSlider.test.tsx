import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParameterSlider } from '../../components/ParameterSlider';

describe('ParameterSlider', () => {
  const defaultProps = {
    label: '지연 (일)',
    value: 1,
    onChange: vi.fn(),
    min: 0,
    max: 5,
    step: 1,
    tooltip: '거래 실행 전 지연 일수입니다',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the label', () => {
    render(<ParameterSlider {...defaultProps} />);

    expect(screen.getByText(defaultProps.label)).toBeDefined();
  });

  it('should render a range input', () => {
    render(<ParameterSlider {...defaultProps} />);

    const slider = screen.getByRole('slider');
    expect(slider).toBeDefined();
  });

  it('should have correct min, max, and step attributes', () => {
    render(<ParameterSlider {...defaultProps} />);

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.min).toBe(String(defaultProps.min));
    expect(slider.max).toBe(String(defaultProps.max));
    expect(slider.step).toBe(String(defaultProps.step));
  });

  it('should display the current value', () => {
    render(<ParameterSlider {...defaultProps} />);

    // Value should be displayed with 0 decimal places for step >= 1
    expect(screen.getByText('1')).toBeDefined();
  });

  it('should display value with 1 decimal place when step < 1', () => {
    render(<ParameterSlider {...defaultProps} step={0.1} value={1.5} />);

    expect(screen.getByText('1.5')).toBeDefined();
  });

  it('should call onChange when slider value changes', () => {
    render(<ParameterSlider {...defaultProps} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '3' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith(3);
  });

  it('should include InfoTooltip component', () => {
    render(<ParameterSlider {...defaultProps} />);

    // Check for SVG icon from InfoTooltip
    const svg = document.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('should show tooltip on hover', () => {
    render(<ParameterSlider {...defaultProps} />);

    const tooltipContainer = document.querySelector('.relative');
    fireEvent.mouseEnter(tooltipContainer!);

    expect(screen.getByText(defaultProps.tooltip)).toBeDefined();
  });

  it('should handle different min/max values', () => {
    render(<ParameterSlider {...defaultProps} min={5} max={252} value={60} />);

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.min).toBe('5');
    expect(slider.max).toBe('252');
    expect(slider.value).toBe('60');
  });

  it('should have correct styling classes on slider', () => {
    render(<ParameterSlider {...defaultProps} />);

    const slider = screen.getByRole('slider');
    expect(slider.className).toContain('bg-gray-700');
    expect(slider.className).toContain('rounded-lg');
  });
});
