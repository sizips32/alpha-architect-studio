import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsDashboard } from '../../components/ResultsDashboard';
import type { BacktestResults, Config } from '../../types';

// Mock ResizeObserver for recharts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock the export utilities
vi.mock('../../utils/pdfExport', () => ({
  exportToPdf: vi.fn(),
}));

vi.mock('../../utils/excelExport', () => ({
  exportToExcel: vi.fn(),
}));

describe('ResultsDashboard', () => {
  const mockConfig: Config = {
    universe: 'TOP_3000',
    delay: 1,
    lookbackDays: 60,
    maxStockWeight: 0.02,
    decay: 0.5,
    neutralization: 'market',
    idea: 'Momentum',
    region: 'US',
    performanceGoal: 'High_IR',
  };

  const mockResults: BacktestResults = {
    kpis: {
      ir: 1.5,
      annualReturn: 0.25,
      maxDrawdown: -0.1,
      turnover: 0.15,
      margin: 0.002,
      correlation: 0.15,
    },
    pnlData: [
      { day: 1, value: 1000 },
      { day: 2, value: 1050 },
      { day: 3, value: 1025 },
      { day: 4, value: 1100 },
      { day: 5, value: 1150 },
    ],
    benchmark: {
      name: 'S&P 500',
      data: [
        { day: 1, value: 1000 },
        { day: 2, value: 1010 },
        { day: 3, value: 1005 },
        { day: 4, value: 1020 },
        { day: 5, value: 1030 },
      ],
      return: 3,
    },
  };

  it('should render welcome guide when no results', () => {
    render(<ResultsDashboard results={null} isLoading={false} />);

    expect(screen.getByText('알파 아키텍트에 오신 것을 환영합니다')).toBeDefined();
  });

  it('should render walkthrough steps when no results', () => {
    render(<ResultsDashboard results={null} isLoading={false} />);

    expect(screen.getByText('1. 시뮬레이션 설정')).toBeDefined();
    expect(screen.getByText('2. 알파 정의')).toBeDefined();
    expect(screen.getByText('3. 백테스트 실행')).toBeDefined();
    expect(screen.getByText('4. 결과 분석')).toBeDefined();
  });

  it('should render loading state', () => {
    render(<ResultsDashboard results={null} isLoading={true} />);

    expect(screen.getByText('시뮬레이션 실행 중...')).toBeDefined();
  });

  it('should render loading spinner when isLoading', () => {
    render(<ResultsDashboard results={null} isLoading={true} />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeDefined();
  });

  it('should render results header when results available', () => {
    render(
      <ResultsDashboard
        results={mockResults}
        isLoading={false}
        expression="rank(close, 20)"
        config={mockConfig}
      />
    );

    expect(screen.getByText('백테스트 결과')).toBeDefined();
  });

  it('should render KPI cards when results available', () => {
    render(
      <ResultsDashboard
        results={mockResults}
        isLoading={false}
        expression="rank(close, 20)"
        config={mockConfig}
      />
    );

    expect(screen.getByText('정보비율')).toBeDefined();
    expect(screen.getByText('연간 수익률')).toBeDefined();
    // '최대 낙폭' appears in both KPI card and PerformanceChart statistics
    expect(screen.getAllByText('최대 낙폭').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('턴오버 (일간)')).toBeDefined();
    expect(screen.getByText('마진 (bps)')).toBeDefined();
    expect(screen.getByText('상관관계')).toBeDefined();
  });

  it('should display correct KPI values', () => {
    render(
      <ResultsDashboard
        results={mockResults}
        isLoading={false}
        expression="rank(close, 20)"
        config={mockConfig}
      />
    );

    expect(screen.getByText('1.50')).toBeDefined(); // IR
    expect(screen.getByText('25.00%')).toBeDefined(); // Annual Return
    expect(screen.getByText('-10.00%')).toBeDefined(); // Max Drawdown
  });

  it('should render export buttons', () => {
    render(
      <ResultsDashboard
        results={mockResults}
        isLoading={false}
        expression="rank(close, 20)"
        config={mockConfig}
      />
    );

    expect(screen.getByText('Excel')).toBeDefined();
    expect(screen.getByText('PDF')).toBeDefined();
  });

  it('should disable export buttons when no expression or config', () => {
    render(<ResultsDashboard results={mockResults} isLoading={false} />);

    const excelButton = screen.getByText('Excel').closest('button');
    const pdfButton = screen.getByText('PDF').closest('button');

    expect(excelButton?.hasAttribute('disabled')).toBe(true);
    expect(pdfButton?.hasAttribute('disabled')).toBe(true);
  });

  it('should enable export buttons when expression and config provided', () => {
    render(
      <ResultsDashboard
        results={mockResults}
        isLoading={false}
        expression="rank(close, 20)"
        config={mockConfig}
      />
    );

    const excelButton = screen.getByText('Excel').closest('button');
    const pdfButton = screen.getByText('PDF').closest('button');

    expect(excelButton?.hasAttribute('disabled')).toBe(false);
    expect(pdfButton?.hasAttribute('disabled')).toBe(false);
  });

  it('should render PerformanceChart', () => {
    render(
      <ResultsDashboard
        results={mockResults}
        isLoading={false}
        expression="rank(close, 20)"
        config={mockConfig}
      />
    );

    expect(screen.getByText('포트폴리오 손익 (PnL)')).toBeDefined();
  });

  it('should render analysis and mindset section', () => {
    render(
      <ResultsDashboard
        results={mockResults}
        isLoading={false}
        expression="rank(close, 20)"
        config={mockConfig}
      />
    );

    expect(screen.getByText('결과 해석 방법')).toBeDefined();
    expect(screen.getByText('성공적인 퀀트의 자세')).toBeDefined();
  });

  it('should call exportToPdf when PDF button is clicked', async () => {
    const { exportToPdf } = await import('../../utils/pdfExport');

    render(
      <ResultsDashboard
        results={mockResults}
        isLoading={false}
        expression="rank(close, 20)"
        config={mockConfig}
      />
    );

    const pdfButton = screen.getByText('PDF').closest('button');
    fireEvent.click(pdfButton!);

    expect(exportToPdf).toHaveBeenCalledWith({
      results: mockResults,
      expression: 'rank(close, 20)',
      config: mockConfig,
    });
  });

  it('should call exportToExcel when Excel button is clicked', async () => {
    const { exportToExcel } = await import('../../utils/excelExport');

    render(
      <ResultsDashboard
        results={mockResults}
        isLoading={false}
        expression="rank(close, 20)"
        config={mockConfig}
      />
    );

    const excelButton = screen.getByText('Excel').closest('button');
    fireEvent.click(excelButton!);

    expect(exportToExcel).toHaveBeenCalledWith({
      results: mockResults,
      expression: 'rank(close, 20)',
      config: mockConfig,
    });
  });
});
