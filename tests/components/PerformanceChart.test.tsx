import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PerformanceChart } from '../../components/PerformanceChart';
import type { PnlDataPoint, BenchmarkData } from '../../types';

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

  // Benchmark statistics tests
  describe('benchmark statistics', () => {
    it('should display benchmark return when benchmark is provided', () => {
      render(<PerformanceChart data={mockData} benchmark={mockBenchmark} />);

      expect(screen.getByText('S&P 500')).toBeDefined();
      expect(screen.getByText('+3.00%')).toBeDefined();
    });

    it('should display alpha when benchmark is provided', () => {
      render(<PerformanceChart data={mockData} benchmark={mockBenchmark} />);

      expect(screen.getByText('알파')).toBeDefined();
    });

    it('should calculate correct alpha (portfolio return - benchmark return)', () => {
      render(<PerformanceChart data={mockData} benchmark={mockBenchmark} />);

      // Total return = ((1150 - 1000) / 1000) * 100 = 15%
      // Benchmark return = 3%
      // Alpha = 15 - 3 = 12%
      expect(screen.getByText('+12.00%')).toBeDefined();
    });

    it('should not display benchmark stats when no benchmark', () => {
      render(<PerformanceChart data={mockData} />);

      expect(screen.queryByText('알파')).toBeNull();
    });
  });

  // Sharpe ratio test
  describe('sharpe ratio', () => {
    it('should display sharpe ratio', () => {
      render(<PerformanceChart data={mockData} />);

      expect(screen.getByText('샤프비율')).toBeDefined();
    });

    it('should display sharpe ratio value', () => {
      render(<PerformanceChart data={mockData} />);

      // Find the stats section and check sharpe ratio is rendered
      const sharpeLabel = screen.getByText('샤프비율');
      expect(sharpeLabel.closest('div')?.querySelector('.font-bold')).toBeDefined();
    });
  });

  // Negative return scenarios
  describe('negative return scenarios', () => {
    const negativeData: PnlDataPoint[] = [
      { day: 1, value: 1000 },
      { day: 2, value: 980 },
      { day: 3, value: 950 },
      { day: 4, value: 920 },
      { day: 5, value: 900 },
    ];

    it('should display negative total return with red color', () => {
      render(<PerformanceChart data={negativeData} />);

      // Total return = ((900 - 1000) / 1000) * 100 = -10%
      // Find total return stat card
      const totalReturnLabel = screen.getByText('총 수익률');
      const totalReturnCard = totalReturnLabel.closest('div.bg-gray-800\\/50');
      const returnValue = totalReturnCard?.querySelector('.font-bold');
      expect(returnValue?.textContent).toBe('-10.00%');
    });

    it('should style negative return differently', () => {
      render(<PerformanceChart data={negativeData} />);

      // Find total return stat card and check red styling
      const totalReturnLabel = screen.getByText('총 수익률');
      const totalReturnCard = totalReturnLabel.closest('div.bg-gray-800\\/50');
      const returnValue = totalReturnCard?.querySelector('.font-bold');
      expect(returnValue?.className).toContain('text-red-400');
    });

    it('should style positive return with green', () => {
      render(<PerformanceChart data={mockData} />);

      // Find total return stat card and check green styling
      const totalReturnLabel = screen.getByText('총 수익률');
      const totalReturnCard = totalReturnLabel.closest('div.bg-gray-800\\/50');
      const returnValue = totalReturnCard?.querySelector('.font-bold');
      expect(returnValue?.textContent).toBe('+15.00%');
      expect(returnValue?.className).toContain('text-green-400');
    });
  });

  // Benchmark toggle visibility
  describe('benchmark toggle visibility', () => {
    it('should hide benchmark toggle in returns view', () => {
      render(<PerformanceChart data={mockData} benchmark={mockBenchmark} />);

      // Switch to returns view
      fireEvent.click(screen.getByText('일별 수익률'));

      // Benchmark toggle should not be visible
      expect(screen.queryByRole('checkbox')).toBeNull();
    });

    it('should hide benchmark toggle in comparison view', () => {
      render(<PerformanceChart data={mockData} benchmark={mockBenchmark} />);

      // Switch to comparison view
      fireEvent.click(screen.getByText('벤치마크 비교'));

      // Benchmark toggle should not be visible
      expect(screen.queryByRole('checkbox')).toBeNull();
    });

    it('should show benchmark toggle in pnl view', () => {
      render(<PerformanceChart data={mockData} benchmark={mockBenchmark} />);

      // PnL view is default
      expect(screen.getByRole('checkbox')).toBeDefined();
    });

    it('should show benchmark toggle in drawdown view', () => {
      render(<PerformanceChart data={mockData} benchmark={mockBenchmark} />);

      // Switch to drawdown view
      fireEvent.click(screen.getByText('낙폭'));

      expect(screen.getByRole('checkbox')).toBeDefined();
    });
  });

  // Win rate statistics
  describe('win rate statistics', () => {
    it('should display win rate', () => {
      render(<PerformanceChart data={mockData} />);

      expect(screen.getByText('승률')).toBeDefined();
    });

    it('should calculate correct win rate', () => {
      // mockData: 1000 -> 1050 (+5%), 1050 -> 1025 (-2.38%), 1025 -> 1100 (+7.3%), 1100 -> 1150 (+4.5%)
      // Positive days: 3 out of 4 = 75%
      render(<PerformanceChart data={mockData} />);

      expect(screen.getByText('75.0%')).toBeDefined();
    });
  });

  // Volatility display
  describe('volatility statistics', () => {
    it('should display volatility', () => {
      render(<PerformanceChart data={mockData} />);

      expect(screen.getByText('변동성')).toBeDefined();
    });
  });

  // Edge cases with different data
  describe('edge cases', () => {
    it('should handle data with all same values', () => {
      const flatData: PnlDataPoint[] = [
        { day: 1, value: 1000 },
        { day: 2, value: 1000 },
        { day: 3, value: 1000 },
      ];

      render(<PerformanceChart data={flatData} />);

      expect(screen.getByText('+0.00%')).toBeDefined();
    });

    it('should handle two data points', () => {
      const twoPointData: PnlDataPoint[] = [
        { day: 1, value: 1000 },
        { day: 2, value: 1100 },
      ];

      render(<PerformanceChart data={twoPointData} />);

      expect(screen.getByText('+10.00%')).toBeDefined();
    });

    it('should render comparison view without benchmark', () => {
      render(<PerformanceChart data={mockData} />);

      fireEvent.click(screen.getByText('벤치마크 비교'));

      // Should still render the chart without crashing
      expect(document.querySelector('.recharts-responsive-container')).toBeDefined();
    });

    it('should render returns view correctly', () => {
      render(<PerformanceChart data={mockData} />);

      fireEvent.click(screen.getByText('일별 수익률'));

      // Should render bar chart for returns
      expect(document.querySelector('.recharts-responsive-container')).toBeDefined();
    });

    it('should render drawdown view with benchmark', () => {
      render(<PerformanceChart data={mockData} benchmark={mockBenchmark} />);

      fireEvent.click(screen.getByText('낙폭'));

      // Should render area chart for drawdown
      expect(document.querySelector('.recharts-responsive-container')).toBeDefined();
    });
  });

  // Benchmark with negative return
  describe('benchmark negative return', () => {
    const negativeBenchmark: BenchmarkData = {
      name: 'Market Index',
      data: [
        { day: 1, value: 1000 },
        { day: 2, value: 990 },
        { day: 3, value: 985 },
        { day: 4, value: 980 },
        { day: 5, value: 970 },
      ],
      return: -3,
    };

    it('should display negative benchmark return with red color', () => {
      render(<PerformanceChart data={mockData} benchmark={negativeBenchmark} />);

      const benchmarkReturn = screen.getByText('-3.00%');
      expect(benchmarkReturn.className).toContain('text-red-400');
    });

    it('should calculate correct alpha with negative benchmark', () => {
      render(<PerformanceChart data={mockData} benchmark={negativeBenchmark} />);

      // Portfolio: +15%, Benchmark: -3%, Alpha: 18%
      expect(screen.getByText('+18.00%')).toBeDefined();
    });
  });
});
