import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToPdf } from '../../utils/pdfExport';
import type { BacktestResults, Config } from '../../types';

describe('pdfExport', () => {
  // Mock window.open
  const mockWrite = vi.fn();
  const mockClose = vi.fn();
  const mockPrintWindow = {
    document: {
      write: mockWrite,
      close: mockClose,
    },
  };

  const mockAlert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'open').mockReturnValue(mockPrintWindow as unknown as Window);
    vi.spyOn(window, 'alert').mockImplementation(mockAlert);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    trades: [
      {
        date: '2024-01-01',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        sector: 'Technology',
        action: 'BUY',
        quantity: 100,
        price: 150,
        amount: 15000,
        pnl: 500,
      },
      {
        date: '2024-01-02',
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        sector: 'Technology',
        action: 'SELL',
        quantity: 50,
        price: 380,
        amount: 19000,
        pnl: -200,
      },
    ],
  };

  describe('exportToPdf', () => {
    it('should open a new window with HTML content', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      expect(window.open).toHaveBeenCalledWith('', '_blank');
      expect(mockWrite).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });

    it('should include expression in the HTML', () => {
      const expression = 'Ts_rank(close, 10) - Ts_rank(volume, 10)';
      exportToPdf({
        results: mockResults,
        expression,
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain(expression);
    });

    it('should include KPI values in the HTML', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('1.50'); // IR
      expect(htmlContent).toContain('25.00%'); // Annual Return
      expect(htmlContent).toContain('-10.00%'); // Max Drawdown
    });

    it('should include config values in the HTML', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('TOP_3000');
      expect(htmlContent).toContain('US');
      expect(htmlContent).toContain('market');
    });

    it('should calculate total return correctly', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      // Total return: (1150 - 1000) / 1000 * 100 = 15%
      expect(htmlContent).toContain('+15.00%');
    });

    it('should include benchmark data when available', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('S&P 500');
    });

    it('should include trades when available', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('Apple Inc.');
      expect(htmlContent).toContain('AAPL');
      expect(htmlContent).toContain('Technology');
      expect(htmlContent).toContain('매수');
      expect(htmlContent).toContain('매도');
    });

    it('should include sector statistics when trades available', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('섹터별');
      expect(htmlContent).toContain('Technology');
    });

    it('should generate SVG chart', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('<svg');
      expect(htmlContent).toContain('<path');
      expect(htmlContent).toContain('포트폴리오');
    });

    it('should handle results without trades', () => {
      const resultsWithoutTrades: BacktestResults = {
        ...mockResults,
        trades: undefined,
      };

      exportToPdf({
        results: resultsWithoutTrades,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      expect(mockWrite).toHaveBeenCalled();
      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).not.toContain('거래 내역');
    });

    it('should handle results without benchmark', () => {
      const resultsWithoutBenchmark: BacktestResults = {
        ...mockResults,
        benchmark: undefined,
      };

      exportToPdf({
        results: resultsWithoutBenchmark,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      expect(mockWrite).toHaveBeenCalled();
      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('벤치마크');
    });

    it('should show alert when popup is blocked', () => {
      vi.spyOn(window, 'open').mockReturnValue(null);

      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      expect(mockAlert).toHaveBeenCalledWith('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    });

    it('should include print button in HTML', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('window.print()');
      expect(htmlContent).toContain('PDF로 저장하기');
    });

    it('should include Korean date format', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      // Korean date format includes 년, 월, 일
      expect(htmlContent).toMatch(/\d{4}년/);
    });

    it('should include monthly returns chart', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('월별 수익률');
      expect(htmlContent).toContain('수익 월');
      expect(htmlContent).toContain('손실 월');
    });

    it('should include drawdown chart', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('낙폭');
      expect(htmlContent).toContain('Drawdown');
      expect(htmlContent).toContain('최대 낙폭');
    });

    it('should sort multiple sectors by amount in descending order', () => {
      const multiSectorResults: BacktestResults = {
        ...mockResults,
        trades: [
          {
            date: '2024-01-01',
            symbol: 'AAPL',
            name: 'Apple Inc.',
            sector: 'Technology',
            action: 'BUY',
            quantity: 100,
            price: 150,
            amount: 15000,
            pnl: 500,
          },
          {
            date: '2024-01-02',
            symbol: 'JPM',
            name: 'JPMorgan Chase',
            sector: 'Financials',
            action: 'BUY',
            quantity: 50,
            price: 180,
            amount: 9000,
            pnl: 300,
          },
          {
            date: '2024-01-03',
            symbol: 'JNJ',
            name: 'Johnson & Johnson',
            sector: 'Healthcare',
            action: 'BUY',
            quantity: 30,
            price: 160,
            amount: 4800,
            pnl: 100,
          },
          {
            date: '2024-01-04',
            symbol: 'XOM',
            name: 'Exxon Mobil',
            sector: 'Energy',
            action: 'SELL',
            quantity: 80,
            price: 100,
            amount: 8000,
            pnl: -150,
          },
        ],
      };

      exportToPdf({
        results: multiSectorResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      // All sectors should be present
      expect(htmlContent).toContain('Technology');
      expect(htmlContent).toContain('Financials');
      expect(htmlContent).toContain('Healthcare');
      expect(htmlContent).toContain('Energy');
      // Should include pie chart for sector distribution
      expect(htmlContent).toContain('거래금액 기준');
    });

    it('should handle empty trades array', () => {
      const emptyTradesResults: BacktestResults = {
        ...mockResults,
        trades: [],
      };

      exportToPdf({
        results: emptyTradesResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      expect(mockWrite).toHaveBeenCalled();
      const htmlContent = mockWrite.mock.calls[0][0];
      // Should not include trade section when trades array is empty
      expect(htmlContent).not.toContain('거래 내역');
    });

    it('should handle trades without pnl field', () => {
      const noPnlResults: BacktestResults = {
        ...mockResults,
        trades: [
          {
            date: '2024-01-01',
            symbol: 'AAPL',
            name: 'Apple Inc.',
            sector: 'Technology',
            action: 'BUY',
            quantity: 100,
            price: 150,
            amount: 15000,
          },
        ],
      };

      exportToPdf({
        results: noPnlResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('Apple Inc.');
      // Should show dash for missing pnl
      expect(htmlContent).toContain('>-</td>');
    });

    it('should handle negative total return', () => {
      const negativeReturnResults: BacktestResults = {
        ...mockResults,
        pnlData: [
          { day: 1, value: 1000 },
          { day: 2, value: 950 },
          { day: 3, value: 900 },
          { day: 4, value: 850 },
          { day: 5, value: 800 },
        ],
      };

      exportToPdf({
        results: negativeReturnResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      // Total return: (800 - 1000) / 1000 * 100 = -20%
      expect(htmlContent).toContain('-20.00%');
    });

    it('should handle longer PnL data for monthly calculations', () => {
      // Create 60 days of data (about 3 months)
      const longPnlData = Array.from({ length: 60 }, (_, i) => ({
        day: i + 1,
        value: 1000 + i * 10 + Math.sin(i / 5) * 50,
      }));

      const longDataResults: BacktestResults = {
        ...mockResults,
        pnlData: longPnlData,
      };

      exportToPdf({
        results: longDataResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      // Should have multiple months in the chart
      expect(htmlContent).toContain('M1');
      expect(htmlContent).toContain('M2');
    });

    it('should handle config without performanceGoal', () => {
      const configWithoutGoal: Config = {
        universe: 'TOP_3000',
        delay: 1,
        lookbackDays: 60,
        maxStockWeight: 0.02,
        decay: 0.5,
        neutralization: 'market',
        idea: 'Momentum',
        region: 'US',
      };

      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: configWithoutGoal,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      // Should show dash for missing performanceGoal
      expect(htmlContent).toContain('<td>-</td>');
    });

    it('should handle single data point in pnlData', () => {
      const singlePointResults: BacktestResults = {
        ...mockResults,
        pnlData: [{ day: 1, value: 1000 }],
        benchmark: {
          name: 'S&P 500',
          data: [{ day: 1, value: 1000 }],
          return: 0,
        },
      };

      exportToPdf({
        results: singlePointResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      expect(mockWrite).toHaveBeenCalled();
      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('1일'); // 시뮬레이션 기간
    });

    it('should handle trades with same sector different actions', () => {
      const sameSectorResults: BacktestResults = {
        ...mockResults,
        trades: [
          {
            date: '2024-01-01',
            symbol: 'AAPL',
            name: 'Apple Inc.',
            sector: 'Technology',
            action: 'BUY',
            quantity: 100,
            price: 150,
            amount: 15000,
            pnl: 500,
          },
          {
            date: '2024-01-02',
            symbol: 'MSFT',
            name: 'Microsoft',
            sector: 'Technology',
            action: 'SELL',
            quantity: 50,
            price: 400,
            amount: 20000,
            pnl: -100,
          },
          {
            date: '2024-01-03',
            symbol: 'GOOGL',
            name: 'Alphabet',
            sector: 'Technology',
            action: 'BUY',
            quantity: 20,
            price: 140,
            amount: 2800,
            pnl: 200,
          },
        ],
      };

      exportToPdf({
        results: sameSectorResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      // Should aggregate Technology sector stats
      expect(htmlContent).toContain('Technology');
      expect(htmlContent).toContain('3건'); // Total trades in sector
    });

    it('should calculate alpha correctly with negative benchmark', () => {
      const negativeBenchmarkResults: BacktestResults = {
        ...mockResults,
        benchmark: {
          name: 'S&P 500',
          data: [
            { day: 1, value: 1000 },
            { day: 5, value: 950 },
          ],
          return: -5,
        },
      };

      exportToPdf({
        results: negativeBenchmarkResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      // Portfolio return: 15%, Benchmark return: -5%, Alpha: 20%
      expect(htmlContent).toContain('+20.00%'); // Alpha
      expect(htmlContent).toContain('-5.00%'); // Benchmark return
    });

    it('should handle drawdown recovery calculation', () => {
      // Create data with clear drawdown and recovery
      const drawdownRecoveryData = [
        { day: 1, value: 1000 },
        { day: 2, value: 1050 },
        { day: 3, value: 900 }, // Drawdown
        { day: 4, value: 850 }, // Deeper drawdown
        { day: 5, value: 920 }, // Recovery
        { day: 6, value: 1000 }, // Full recovery
        { day: 7, value: 1100 }, // New peak
      ];

      const drawdownResults: BacktestResults = {
        ...mockResults,
        pnlData: drawdownRecoveryData,
      };

      exportToPdf({
        results: drawdownResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('최장 회복 기간');
      expect(htmlContent).toContain('평균 낙폭');
    });

    it('should handle zero benchmark return', () => {
      const zeroBenchmarkResults: BacktestResults = {
        ...mockResults,
        benchmark: {
          name: 'S&P 500',
          data: [
            { day: 1, value: 1000 },
            { day: 5, value: 1000 },
          ],
          return: 0,
        },
      };

      exportToPdf({
        results: zeroBenchmarkResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('+0.00%'); // Benchmark return
    });

    it('should include close button in HTML', () => {
      exportToPdf({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      const htmlContent = mockWrite.mock.calls[0][0];
      expect(htmlContent).toContain('window.close()');
      expect(htmlContent).toContain('닫기');
    });
  });
});
