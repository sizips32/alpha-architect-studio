import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToExcel } from '../../utils/excelExport';
import type { BacktestResults, Config } from '../../types';

describe('excelExport', () => {
  // Mock DOM APIs
  const mockClick = vi.fn();
  const mockAppendChild = vi.fn();
  const mockRemoveChild = vi.fn();
  let mockLink: HTMLAnchorElement;
  let capturedBlobContent: string | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedBlobContent = null;

    mockLink = {
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

    // Define URL methods if they don't exist (for test environment)
    if (!URL.createObjectURL) {
      (URL as any).createObjectURL = vi.fn();
    }
    if (!URL.revokeObjectURL) {
      (URL as any).revokeObjectURL = vi.fn();
    }

    // Mock URL.createObjectURL to capture blob content
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob: Blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        capturedBlobContent = reader.result as string;
      };
      reader.readAsText(blob);
      return 'blob:mock-url';
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
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
    region: 'KR',
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
      name: 'KOSPI',
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
        symbol: '005930',
        name: '삼성전자',
        sector: '정보기술',
        action: 'BUY',
        quantity: 100,
        price: 70000,
        amount: 7000000,
        pnl: 500000,
      },
      {
        date: '2024-01-02',
        symbol: '000660',
        name: 'SK하이닉스',
        sector: '정보기술',
        action: 'SELL',
        quantity: 50,
        price: 150000,
        amount: 7500000,
        pnl: -200000,
      },
      {
        date: '2024-01-03',
        symbol: '035420',
        name: 'NAVER',
        sector: '커뮤니케이션',
        action: 'BUY',
        quantity: 30,
        price: 200000,
        amount: 6000000,
      },
    ],
  };

  describe('exportToExcel', () => {
    it('should create a download link and trigger click', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });

    it('should set correct filename with date', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      expect(mockLink.download).toMatch(/^backtest_report_\d{4}-\d{2}-\d{2}\.xls$/);
    });

    it('should create blob URL', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should generate valid Excel XML structure', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      // Wait for FileReader to complete
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain('<?xml version="1.0"');
          expect(capturedBlobContent).toContain('<?mso-application progid="Excel.Sheet"?>');
          expect(capturedBlobContent).toContain('<Workbook');
          resolve();
        }, 10);
      });
    });

    it('should include all worksheets', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain('ss:Name="요약"');
          expect(capturedBlobContent).toContain('ss:Name="PnL 데이터"');
          expect(capturedBlobContent).toContain('ss:Name="월별 수익률"');
          expect(capturedBlobContent).toContain('ss:Name="섹터별 통계"');
          expect(capturedBlobContent).toContain('ss:Name="거래 내역"');
          resolve();
        }, 10);
      });
    });

    it('should include expression in summary sheet', () => {
      const expression = 'Ts_rank(close, 10)';
      exportToExcel({
        results: mockResults,
        expression,
        config: mockConfig,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain(expression);
          resolve();
        }, 10);
      });
    });

    it('should include KPI values', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain('1.5'); // IR
          expect(capturedBlobContent).toContain('정보비율');
          expect(capturedBlobContent).toContain('연간 수익률');
          expect(capturedBlobContent).toContain('최대 낙폭');
          resolve();
        }, 10);
      });
    });

    it('should include config values', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain('TOP_3000');
          expect(capturedBlobContent).toContain('KR');
          expect(capturedBlobContent).toContain('market');
          resolve();
        }, 10);
      });
    });

    it('should include PnL data', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain('1000');
          expect(capturedBlobContent).toContain('1050');
          expect(capturedBlobContent).toContain('1150');
          resolve();
        }, 10);
      });
    });

    it('should include benchmark data', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain('KOSPI');
          resolve();
        }, 10);
      });
    });

    it('should include trades data', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain('삼성전자');
          expect(capturedBlobContent).toContain('005930');
          expect(capturedBlobContent).toContain('SK하이닉스');
          expect(capturedBlobContent).toContain('NAVER');
          expect(capturedBlobContent).toContain('매수');
          expect(capturedBlobContent).toContain('매도');
          resolve();
        }, 10);
      });
    });

    it('should include sector statistics', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain('정보기술');
          expect(capturedBlobContent).toContain('커뮤니케이션');
          resolve();
        }, 10);
      });
    });

    it('should calculate monthly returns', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain('월별 수익률');
          expect(capturedBlobContent).toContain('수익 월');
          expect(capturedBlobContent).toContain('손실 월');
          resolve();
        }, 10);
      });
    });

    it('should calculate drawdown data', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain('낙폭');
          resolve();
        }, 10);
      });
    });

    it('should handle results without trades', () => {
      const resultsWithoutTrades: BacktestResults = {
        ...mockResults,
        trades: undefined,
      };

      exportToExcel({
        results: resultsWithoutTrades,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle results without benchmark', () => {
      const resultsWithoutBenchmark: BacktestResults = {
        ...mockResults,
        benchmark: undefined,
      };

      exportToExcel({
        results: resultsWithoutBenchmark,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain('벤치마크');
          resolve();
        }, 10);
      });
    });

    it('should include Excel styles', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(capturedBlobContent).toContain('<Styles>');
          expect(capturedBlobContent).toContain('ss:ID="Header"');
          expect(capturedBlobContent).toContain('ss:ID="SubHeader"');
          resolve();
        }, 10);
      });
    });

    it('should set link href to blob URL', () => {
      exportToExcel({
        results: mockResults,
        expression: 'rank(close, 20)',
        config: mockConfig,
      });

      expect(mockLink.href).toBe('blob:mock-url');
    });
  });
});
