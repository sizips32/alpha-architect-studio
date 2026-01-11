import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';

// Mock ResizeObserver for recharts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock the services
vi.mock('../../services/geminiService', () => ({
  generateAlphaExpression: vi.fn().mockResolvedValue('rank(close, 10)'),
}));

vi.mock('../../services/backtestService', () => ({
  simulateBacktest: vi.fn().mockResolvedValue({
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
    ],
    benchmark: {
      name: 'S&P 500',
      data: [
        { day: 1, value: 1000 },
        { day: 2, value: 1010 },
      ],
      return: 1,
    },
  }),
}));

vi.mock('../../services/marketDataService', () => ({
  getMarketIndices: vi.fn().mockResolvedValue({
    data: [
      {
        symbol: '^GSPC',
        name: 'S&P 500',
        price: 5000,
        changePercent: 0.5,
        volume: 1000000,
        marketCap: 0,
        high52Week: 5200,
        low52Week: 4200,
      },
    ],
  }),
  getKoreanTopStocks: vi.fn().mockResolvedValue({ data: [] }),
  getUSTechStocks: vi.fn().mockResolvedValue({ data: [] }),
  searchStocks: vi.fn().mockResolvedValue({ results: [] }),
  getStockSummary: vi.fn().mockResolvedValue(null),
  getHistoricalData: vi.fn().mockResolvedValue({ data: [] }),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Header component', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('알파 아키텍트')).toBeDefined();
    });
  });

  it('should render the Footer component', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('contentinfo')).toBeDefined();
    });
  });

  it('should render the backtest button', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('백테스트 실행')).toBeDefined();
    });
  });

  it('should render KRGuideExpander', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('한글 사용 가이드')).toBeDefined();
    });
  });

  it('should render ConfigPanel with loading state initially', async () => {
    render(<App />);

    // ConfigPanel should be lazy loaded
    await waitFor(() => {
      // Look for config panel content
      expect(screen.getByText('지역 & 유니버스')).toBeDefined();
    });
  });

  it('should render ExpressionEditor with default expression', async () => {
    render(<App />);

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(
        '예: rank(close / delay(close, 1))'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toContain('Ts_rank');
    });
  });

  it('should run backtest when button is clicked', async () => {
    const { simulateBacktest } = await import('../../services/backtestService');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('백테스트 실행')).toBeDefined();
    });

    const runButton = screen.getByText('백테스트 실행');
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(simulateBacktest).toHaveBeenCalled();
    });
  });

  it('should display results after backtest', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('백테스트 실행')).toBeDefined();
    });

    const runButton = screen.getByText('백테스트 실행');
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText('백테스트 결과')).toBeDefined();
    });
  });

  it('should show loading state while running backtest', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('백테스트 실행')).toBeDefined();
    });

    const runButton = screen.getByText('백테스트 실행');
    fireEvent.click(runButton);

    // During loading, "시뮬레이션 실행 중..." should appear
    await waitFor(() => {
      expect(screen.getByText('시뮬레이션 실행 중...')).toBeDefined();
    });
  });

  it('should update expression when typed in editor', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('예: rank(close / delay(close, 1))')).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText('예: rank(close / delay(close, 1))');
    fireEvent.change(textarea, { target: { value: 'new expression' } });

    expect((textarea as HTMLTextAreaElement).value).toBe('new expression');
  });

  it('should have correct main layout structure', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('백테스트 실행')).toBeDefined();
    });

    const mainElement = container.querySelector('main');
    expect(mainElement).toBeDefined();
    expect(mainElement?.className).toContain('container');
    expect(mainElement?.className).toContain('grid');
  });

  it('should render DevelopmentCanvas', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('퀀트의 마인드셋: 알파 개발 가이드')).toBeDefined();
    });
  });

  it('should render MarketTicker', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('실시간 시세')).toBeDefined();
    });
  });

  it('should handle AI expression generation', async () => {
    const { generateAlphaExpression } = await import('../../services/geminiService');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('트레이딩 아이디어를 설명하세요...')).toBeDefined();
    });

    const aiInput = screen.getByPlaceholderText('트레이딩 아이디어를 설명하세요...');
    fireEvent.change(aiInput, { target: { value: 'momentum strategy' } });

    const generateButton = screen.getByText('생성');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(generateAlphaExpression).toHaveBeenCalledWith('momentum strategy');
    });
  });

  it('should display error when backtest fails', async () => {
    const { simulateBacktest } = await import('../../services/backtestService');
    (simulateBacktest as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Backtest failed')
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('백테스트 실행')).toBeDefined();
    });

    const runButton = screen.getByText('백테스트 실행');
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
    });
  });

  it('should close error alert when dismiss button is clicked', async () => {
    const { simulateBacktest } = await import('../../services/backtestService');
    (simulateBacktest as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Backtest failed')
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('백테스트 실행')).toBeDefined();
    });

    const runButton = screen.getByText('백테스트 실행');
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
    });

    const dismissButton = screen.getByLabelText('닫기');
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  it('should apply preset from KRGuideExpander', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('한글 사용 가이드')).toBeDefined();
    });

    // Expand the guide
    const guideToggle = screen.getByRole('button', { expanded: false });
    fireEvent.click(guideToggle);

    await waitFor(() => {
      expect(screen.getByText(/모멘텀 기본/)).toBeDefined();
    });

    // Click on a preset
    const presetButton = screen.getByText(/모멘텀 기본/);
    fireEvent.click(presetButton);

    // The expression should be updated (backtest runs automatically with preset)
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(
        '예: rank(close / delay(close, 1))'
      ) as HTMLTextAreaElement;
      expect(textarea.value).not.toBe('');
    });
  });

  it('should have correct background styling', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('백테스트 실행')).toBeDefined();
    });

    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv.className).toContain('bg-gray-950');
    expect(rootDiv.className).toContain('min-h-screen');
  });
});
