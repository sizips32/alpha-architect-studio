import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KpiCard } from '../../components/KpiCard';

describe('KpiCard', () => {
  const defaultProps = {
    title: '정보비율',
    value: '1.50',
    tooltip: '위험 조정 수익률을 측정합니다',
  };

  it('should render the title', () => {
    render(<KpiCard {...defaultProps} />);

    expect(screen.getByText(defaultProps.title)).toBeDefined();
  });

  it('should render the value', () => {
    render(<KpiCard {...defaultProps} />);

    expect(screen.getByText(defaultProps.value)).toBeDefined();
  });

  it('should render numeric value', () => {
    render(<KpiCard {...defaultProps} value={25.5} />);

    expect(screen.getByText('25.5')).toBeDefined();
  });

  it('should render with positive styling when isPositive is true', () => {
    render(<KpiCard {...defaultProps} isPositive={true} />);

    const valueElement = screen.getByText(defaultProps.value);
    expect(valueElement.className).toContain('text-green-400');
  });

  it('should render with negative styling when isPositive is false', () => {
    render(<KpiCard {...defaultProps} isPositive={false} />);

    const valueElement = screen.getByText(defaultProps.value);
    expect(valueElement.className).toContain('text-red-400');
  });

  it('should render with neutral styling when isPositive is undefined', () => {
    render(<KpiCard {...defaultProps} />);

    const valueElement = screen.getByText(defaultProps.value);
    expect(valueElement.className).toContain('text-gray-100');
  });

  it('should include InfoTooltip component', () => {
    render(<KpiCard {...defaultProps} />);

    // Check for SVG icon from InfoTooltip
    const svg = document.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('should show tooltip on hover', () => {
    render(<KpiCard {...defaultProps} />);

    const tooltipContainer = document.querySelector('.relative');
    fireEvent.mouseEnter(tooltipContainer!);

    expect(screen.getByText(defaultProps.tooltip)).toBeDefined();
  });

  it('should have correct card styling', () => {
    const { container } = render(<KpiCard {...defaultProps} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-gray-900');
    expect(card.className).toContain('rounded-lg');
    expect(card.className).toContain('border');
  });

  it('should have displayName set', () => {
    expect(KpiCard.displayName).toBe('KpiCard');
  });
});
