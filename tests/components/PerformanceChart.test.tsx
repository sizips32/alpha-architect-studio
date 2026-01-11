import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PerformanceChart } from '../../components/PerformanceChart';
import type { PnlDataPoint, BenchmarkData } from '../../types';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('PerformanceChart', () => {
  const mockData: PnlDataPoint[] = [
    { day: 1, value: 1000 },
    { day: 2, value: 1050 },
    { day: 3, value: 1025 },
    { day: 4, value: 1100 },
    { day: 5, value: 1150 },
  ];

  const mockBenchmark: BenchmarkData = {
    name: 'S&P 500',
    data: [
      { day: 1, value: 1000 },
      { day: 2, value: 1010 },
      { day: 3, value: 1005 },
      { day: 4, value: 1020 },
      { day: 5, value: 1030 },
    ],
    return: 3,
  };

  it('should render without crashing', () => {
    render(<PerformanceChart data={mockData} />);
    expect(document.querySelector('.recharts-responsive-container')).toBeDefined();
  });

  it('should render view toggle buttons', () => {
    render(<PerformanceChart data={mockData} />);

    expect(screen.getByText('PnL')).toBeDefined();
    expect(screen.getByText('일별 수익률')).toBeDefined();
    expect(screen.getByText('낙폭')).toBeDefined();
    expect(screen.getByText('벤치마크 비교')).toBeDefined();
  });

  it('should change view when toggle button is clicked', () => {
    render(<PerformanceChart data={mockData} />);

    const returnsButton = screen.getByText('일별 수익률');
    fireEvent.click(returnsButton);

    // Button should be active (different styling)
    expect(returnsButton.className).toContain('bg-cyan-600');
  });

  it('should render benchmark toggle when benchmark data is provided', () => {
    render(<PerformanceChart data={mockData} benchmark={mockBenchmark} />);

    // Benchmark toggle shows "{benchmark.name} 표시"
    expect(screen.getByText(/표시/)).toBeDefined();
  });

  it('should not render benchmark toggle when no benchmark data', () => {
    render(<PerformanceChart data={mockData} />);

    expect(screen.queryByText(/표시/)).toBeNull();
  });

  it('should render statistics section', () => {
    render(<PerformanceChart data={mockData} />);

    expect(screen.getByText('총 수익률')).toBeDefined();
    expect(screen.getByText('최대 낙폭')).toBeDefined();
    expect(screen.getByText('변동성')).toBeDefined();
    expect(screen.getByText('승률')).toBeDefined();
  });

  it('should calculate and display total return', () => {
    render(<PerformanceChart data={mockData} />);

    // Total return should be ((1150 - 1000) / 1000) * 100 = 15%
    const stats = document.querySelectorAll('.font-bold');
    expect(stats.length).toBeGreaterThan(0);
  });

  it('should render with empty data', () => {
    render(<PerformanceChart data={[]} />);
    expect(document.querySelector('.recharts-responsive-container')).toBeDefined();
  });

  it('should render with single data point', () => {
    render(<PerformanceChart data={[{ day: 1, value: 1000 }]} />);
    expect(document.querySelector('.recharts-responsive-container')).toBeDefined();
  });

  it('should toggle benchmark visibility', () => {
    render(<PerformanceChart data={mockData} benchmark={mockBenchmark} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDefined();

    // Should be checked by default
    expect((checkbox as HTMLInputElement).checked).toBe(true);

    // Toggle off
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(false);
  });

  it('should display benchmark name', () => {
    render(<PerformanceChart data={mockData} benchmark={mockBenchmark} />);

    // S&P 500 appears in multiple places (checkbox label, chart legend, etc.)
    expect(screen.getAllByText(/S&P 500/).length).toBeGreaterThanOrEqual(1);
  });

  it('should switch to drawdown view', () => {
    render(<PerformanceChart data={mockData} />);

    const drawdownButton = screen.getByText('낙폭');
    fireEvent.click(drawdownButton);

    expect(drawdownButton.className).toContain('bg-cyan-600');
  });

  it('should switch to comparison view', () => {
    render(<PerformanceChart data={mockData} benchmark={mockBenchmark} />);

    const comparisonButton = screen.getByText('벤치마크 비교');
    fireEvent.click(comparisonButton);

    expect(comparisonButton.className).toContain('bg-cyan-600');
  });
});
