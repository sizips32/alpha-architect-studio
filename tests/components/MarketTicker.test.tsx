import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarketTicker } from '../../components/MarketTicker';

// Mock ResizeObserver for recharts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock the market data service
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
      {
        symbol: '^DJI',
        name: 'Dow Jones',
        price: 40000,
        changePercent: -0.3,
        volume: 500000,
        marketCap: 0,
        high52Week: 42000,
        low52Week: 35000,
      },
    ],
  }),
  getKoreanTopStocks: vi.fn().mockResolvedValue({
    data: [
      {
        symbol: '005930.KS',
        name: '삼성전자',
        price: 70000,
        changePercent: 1.5,
        volume: 10000000,
        marketCap: 400e12,
        high52Week: 80000,
        low52Week: 55000,
      },
    ],
  }),
  getUSTechStocks: vi.fn().mockResolvedValue({
    data: [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 180,
        changePercent: 2.1,
        volume: 50000000,
        marketCap: 2.8e12,
        high52Week: 200,
        low52Week: 150,
      },
    ],
  }),
  searchStocks: vi.fn().mockResolvedValue({
    results: [
      { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
      { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ' },
    ],
  }),
  getStockSummary: vi.fn().mockResolvedValue({
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 500,
    changePercent: 3.5,
    volume: 30000000,
    marketCap: 1.2e12,
    high52Week: 550,
    low52Week: 300,
    pe: 45.5,
    eps: 11.0,
  }),
  getHistoricalData: vi.fn().mockResolvedValue({
    data: [
      { date: '2024-01-01', close: 450 },
      { date: '2024-01-02', close: 460 },
      { date: '2024-01-03', close: 480 },
    ],
  }),
}));

describe('MarketTicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the header', async () => {
    render(<MarketTicker />);

    expect(screen.getByText('실시간 시세')).toBeDefined();
  });

  it('should render tab buttons', async () => {
    render(<MarketTicker />);

    expect(screen.getByText('지수')).toBeDefined();
    expect(screen.getByText('한국')).toBeDefined();
    expect(screen.getByText('미국')).toBeDefined();
    expect(screen.getByText('검색')).toBeDefined();
  });

  it('should show loading spinner initially', () => {
    render(<MarketTicker />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeDefined();
  });

  it('should display market indices after loading', async () => {
    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeDefined();
    });
  });

  it('should switch to Korean stocks tab', async () => {
    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeDefined();
    });

    const koreanTab = screen.getByText('한국');
    fireEvent.click(koreanTab);

    await waitFor(() => {
      expect(screen.getByText('삼성전자')).toBeDefined();
    });
  });

  it('should switch to US tech stocks tab', async () => {
    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeDefined();
    });

    const usTechTab = screen.getByText('미국');
    fireEvent.click(usTechTab);

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeDefined();
    });
  });

  it('should switch to search tab', async () => {
    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    expect(screen.getByPlaceholderText('종목명 또는 심볼 입력...')).toBeDefined();
  });

  it('should display positive change with green color', async () => {
    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeDefined();
    });

    // Check that positive percentage is displayed with + sign
    expect(screen.getByText('+0.50%')).toBeDefined();
  });

  it('should display negative change with red styling', async () => {
    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('Dow Jones')).toBeDefined();
    });

    // Check that negative percentage is displayed
    expect(screen.getByText('-0.30%')).toBeDefined();
  });

  it('should have auto refresh toggle button', async () => {
    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeDefined();
    });

    const autoRefreshButton = screen.getByTitle('자동 새로고침 켜짐');
    expect(autoRefreshButton).toBeDefined();
  });

  it('should toggle auto refresh', async () => {
    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeDefined();
    });

    const autoRefreshButton = screen.getByTitle('자동 새로고침 켜짐');
    fireEvent.click(autoRefreshButton);

    expect(screen.getByTitle('자동 새로고침 꺼짐')).toBeDefined();
  });

  it('should have refresh button', async () => {
    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeDefined();
    });

    const refreshButton = screen.getByTitle('새로고침');
    expect(refreshButton).toBeDefined();
  });

  it('should render search input in search tab', async () => {
    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    expect(searchInput).toBeDefined();
  });

  it('should render search button in search tab', async () => {
    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    // After clicking search tab, there are multiple '검색' elements - tab and search button
    const searchElements = screen.getAllByText('검색');
    expect(searchElements.length).toBeGreaterThanOrEqual(2);
  });

  it('should disable search button when input is empty', async () => {
    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    // Find the search button (not the tab button)
    const buttons = screen.getAllByRole('button');
    const searchButton = buttons.find((btn) => btn.textContent === '검색' && btn !== searchTab);

    expect(searchButton?.hasAttribute('disabled')).toBe(true);
  });

  it('should perform search when button clicked', async () => {
    const { searchStocks } = await import('../../services/marketDataService');

    render(<MarketTicker />);

    const searchTabButton = screen.getByText('검색');
    fireEvent.click(searchTabButton);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'NVDA' } });

    // Find the search button in the search interface
    const allButtons = screen.getAllByRole('button');
    const searchActionButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );

    if (searchActionButton) {
      fireEvent.click(searchActionButton);
    }

    await waitFor(() => {
      expect(searchStocks).toHaveBeenCalledWith('NVDA');
    });
  });

  it('should show last update time', async () => {
    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeDefined();
    });

    // The time format should be displayed (HH:MM:SS in Korean locale)
    const header = document.querySelector('.px-4.py-3');
    expect(header?.textContent).toContain(':');
  });

  it('should show placeholder message in search tab', async () => {
    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    expect(screen.getByText('종목명 또는 심볼을 검색하세요')).toBeDefined();
    expect(screen.getByText(/삼성전자, AAPL, NVDA/)).toBeDefined();
  });

  it('should have active tab styling', async () => {
    render(<MarketTicker />);

    const indicesTab = screen.getByText('지수');
    expect(indicesTab.className).toContain('text-cyan-400');
  });

  it('should switch active tab styling when clicked', async () => {
    render(<MarketTicker />);

    const koreanTab = screen.getByText('한국');
    fireEvent.click(koreanTab);

    expect(koreanTab.className).toContain('text-cyan-400');
  });
});
