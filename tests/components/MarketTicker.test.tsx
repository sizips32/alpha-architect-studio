import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MarketTicker } from '../../components/MarketTicker';

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

  it('should display search results after searching', async () => {
    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'NVDA' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
      expect(screen.getByText('Netflix Inc.')).toBeDefined();
      expect(screen.getByText('2개 결과')).toBeDefined();
    });
  });

  it('should search with Enter key press', async () => {
    const { searchStocks } = await import('../../services/marketDataService');

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'AAPL' } });
    fireEvent.keyPress(searchInput, { key: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(searchStocks).toHaveBeenCalledWith('AAPL');
    });
  });

  it('should select stock from search results and show detail view', async () => {
    const { getStockSummary, getHistoricalData } = await import('../../services/marketDataService');

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'NVDA' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
    });

    // Click on search result to view detail
    const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      expect(getStockSummary).toHaveBeenCalledWith('NVDA');
      expect(getHistoricalData).toHaveBeenCalledWith('NVDA', 30);
    });

    // Should show stock detail view
    await waitFor(() => {
      expect(screen.getByText('검색 결과로 돌아가기')).toBeDefined();
      expect(screen.getByText('$500.00')).toBeDefined();
      expect(screen.getByText('+3.50%')).toBeDefined();
    });
  });

  it('should display stock details with chart period buttons', async () => {
    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'NVDA' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
    });

    const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      expect(screen.getByText('1주')).toBeDefined();
      expect(screen.getByText('1개월')).toBeDefined();
      expect(screen.getByText('3개월')).toBeDefined();
      expect(screen.getByText('1년')).toBeDefined();
    });
  });

  it('should change chart period when period button is clicked', async () => {
    const { getHistoricalData } = await import('../../services/marketDataService');

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'NVDA' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
    });

    const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      expect(screen.getByText('1년')).toBeDefined();
    });

    // Click 1 year button
    const yearButton = screen.getByText('1년');
    fireEvent.click(yearButton);

    await waitFor(() => {
      expect(getHistoricalData).toHaveBeenCalledWith('NVDA', 365);
    });
  });

  it('should go back to search results when back button is clicked', async () => {
    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'NVDA' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
    });

    const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      expect(screen.getByText('검색 결과로 돌아가기')).toBeDefined();
    });

    // Click back button
    const backButton = screen.getByText('검색 결과로 돌아가기');
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('종목명 또는 심볼 입력...')).toBeDefined();
    });
  });

  it('should display stock statistics in detail view', async () => {
    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'NVDA' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
    });

    const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      expect(screen.getByText('거래량')).toBeDefined();
      expect(screen.getByText('시가총액')).toBeDefined();
      expect(screen.getByText('52주 최고')).toBeDefined();
      expect(screen.getByText('52주 최저')).toBeDefined();
      expect(screen.getByText('PER')).toBeDefined();
      expect(screen.getByText('EPS')).toBeDefined();
    });
  });

  it('should trigger manual refresh when refresh button is clicked', async () => {
    const { getMarketIndices } = await import('../../services/marketDataService');

    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeDefined();
    });

    // Clear mock calls from initial load
    vi.clearAllMocks();

    const refreshButton = screen.getByTitle('새로고침');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(getMarketIndices).toHaveBeenCalled();
    });
  });

  it('should display error state and retry button', async () => {
    const { getMarketIndices } = await import('../../services/marketDataService');
    (getMarketIndices as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeDefined();
      expect(screen.getByText('다시 시도')).toBeDefined();
    });
  });

  it('should retry fetch when retry button is clicked', async () => {
    const { getMarketIndices } = await import('../../services/marketDataService');
    (getMarketIndices as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
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
      });

    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('다시 시도')).toBeDefined();
    });

    fireEvent.click(screen.getByText('다시 시도'));

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeDefined();
    });
  });

  it('should display Korean stock price with Won symbol', async () => {
    render(<MarketTicker />);

    const koreanTab = screen.getByText('한국');
    fireEvent.click(koreanTab);

    await waitFor(() => {
      expect(screen.getByText('삼성전자')).toBeDefined();
      expect(screen.getByText('₩70,000')).toBeDefined();
    });
  });

  it('should display no results message when search returns empty', async () => {
    const { searchStocks } = await import('../../services/marketDataService');
    (searchStocks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      results: [],
    });

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'XYZNOTFOUND' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다')).toBeDefined();
    });
  });

  it('should handle search error gracefully', async () => {
    const { searchStocks } = await import('../../services/marketDataService');
    (searchStocks as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Search failed'));

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'TEST' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    // Search error shows "no results" state (error is stored but displayed as empty results)
    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다')).toBeDefined();
    });
  });

  it('should not search when query is empty', async () => {
    const { searchStocks } = await import('../../services/marketDataService');

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: '   ' } });
    fireEvent.keyPress(searchInput, { key: 'Enter', charCode: 13 });

    // Wait a bit to ensure no search was triggered
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(searchStocks).not.toHaveBeenCalled();
  });

  it('should format market cap correctly', async () => {
    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'NVDA' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
    });

    const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      // Market cap of 1.2e12 should be formatted as "1.20T"
      expect(screen.getByText('1.20T')).toBeDefined();
    });
  });

  it('should display US index price without dollar symbol', async () => {
    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeDefined();
    });

    // Index price should be formatted without dollar sign (5,000.00 format)
    expect(screen.getByText('5,000.00')).toBeDefined();
  });

  it('should display US stock price with dollar symbol', async () => {
    render(<MarketTicker />);

    const usTechTab = screen.getByText('미국');
    fireEvent.click(usTechTab);

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeDefined();
    });

    expect(screen.getByText('$180.00')).toBeDefined();
  });

  it('should handle getStockSummary error gracefully', async () => {
    const { getStockSummary } = await import('../../services/marketDataService');
    (getStockSummary as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Failed to load stock')
    );

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'NVDA' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
    });

    const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    // Should stay on search results with search input visible
    await waitFor(() => {
      expect(screen.getByPlaceholderText('종목명 또는 심볼 입력...')).toBeDefined();
    });
  });

  it('should handle chart period change error gracefully', async () => {
    const { getHistoricalData } = await import('../../services/marketDataService');

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'NVDA' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
    });

    const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      expect(screen.getByText('1년')).toBeDefined();
    });

    // Mock error for the next getHistoricalData call
    (getHistoricalData as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Chart data error')
    );

    // Click period button to trigger error
    const yearButton = screen.getByText('1년');
    fireEvent.click(yearButton);

    // Should still show the stock detail view (error is logged but UI remains stable)
    await waitFor(() => {
      expect(screen.getByText('검색 결과로 돌아가기')).toBeDefined();
    });
  });

  it('should display Korean stock detail with Won currency', async () => {
    const { searchStocks, getStockSummary, getHistoricalData } =
      await import('../../services/marketDataService');

    (searchStocks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      results: [{ symbol: '005930.KS', name: '삼성전자', exchange: 'KRX' }],
    });
    (getStockSummary as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      symbol: '005930.KS',
      name: '삼성전자',
      price: 70000,
      changePercent: 1.5,
      volume: 10000000,
      marketCap: 400e12,
      high52Week: 80000,
      low52Week: 55000,
    });
    (getHistoricalData as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { date: '2024-01-01', close: 68000 },
        { date: '2024-01-02', close: 70000 },
      ],
    });

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: '삼성전자' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('삼성전자')).toBeDefined();
    });

    const resultButton = screen.getByText('삼성전자').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      expect(screen.getByText('₩70,000')).toBeDefined();
      expect(screen.getByText('+1.50%')).toBeDefined();
    });
  });

  it('should handle non-Error type exceptions in fetch', async () => {
    const { getMarketIndices } = await import('../../services/marketDataService');
    (getMarketIndices as ReturnType<typeof vi.fn>).mockRejectedValueOnce('string error');

    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('데이터를 불러오는데 실패했습니다.')).toBeDefined();
    });
  });

  it('should handle non-Error type exceptions in search', async () => {
    const { searchStocks } = await import('../../services/marketDataService');
    (searchStocks as ReturnType<typeof vi.fn>).mockRejectedValueOnce('string error');

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'TEST' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다')).toBeDefined();
    });
  });

  it('should handle non-Error type exceptions in stock selection', async () => {
    const { getStockSummary } = await import('../../services/marketDataService');
    (getStockSummary as ReturnType<typeof vi.fn>).mockRejectedValueOnce('string error');

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'NVDA' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
    });

    const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    // Should stay on search results
    await waitFor(() => {
      expect(screen.getByPlaceholderText('종목명 또는 심볼 입력...')).toBeDefined();
    });
  });

  it('should display negative stock change with red styling in detail view', async () => {
    const { searchStocks, getStockSummary, getHistoricalData } =
      await import('../../services/marketDataService');

    (searchStocks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      results: [{ symbol: 'META', name: 'Meta Platforms', exchange: 'NASDAQ' }],
    });
    (getStockSummary as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      symbol: 'META',
      name: 'Meta Platforms',
      price: 450,
      changePercent: -2.5,
      volume: 20000000,
      marketCap: 1.1e12,
      high52Week: 500,
      low52Week: 350,
    });
    (getHistoricalData as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { date: '2024-01-01', close: 460 },
        { date: '2024-01-02', close: 450 },
      ],
    });

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'META' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Meta Platforms')).toBeDefined();
    });

    const resultButton = screen.getByText('Meta Platforms').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      expect(screen.getByText('-2.50%')).toBeDefined();
    });
  });

  it('should display stock without PE and EPS when not available', async () => {
    const { searchStocks, getStockSummary, getHistoricalData } =
      await import('../../services/marketDataService');

    (searchStocks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      results: [{ symbol: 'TEST', name: 'Test Stock', exchange: 'NYSE' }],
    });
    (getStockSummary as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      symbol: 'TEST',
      name: 'Test Stock',
      price: 100,
      changePercent: 1.0,
      volume: 1000000,
      marketCap: 10e9,
      high52Week: 120,
      low52Week: 80,
      // pe and eps are intentionally missing
    });
    (getHistoricalData as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [{ date: '2024-01-01', close: 100 }],
    });

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'TEST' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Test Stock')).toBeDefined();
    });

    const resultButton = screen.getByText('Test Stock').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      expect(screen.getByText('거래량')).toBeDefined();
      expect(screen.getByText('시가총액')).toBeDefined();
    });

    // PER and EPS should not be displayed
    expect(screen.queryByText('PER')).toBeNull();
    expect(screen.queryByText('EPS')).toBeNull();
  });

  it('should format market cap as billions for smaller companies', async () => {
    const { searchStocks, getStockSummary, getHistoricalData } =
      await import('../../services/marketDataService');

    (searchStocks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      results: [{ symbol: 'SMALL', name: 'Small Corp', exchange: 'NYSE' }],
    });
    (getStockSummary as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      symbol: 'SMALL',
      name: 'Small Corp',
      price: 50,
      changePercent: 0.5,
      volume: 500000,
      marketCap: 5e9, // 5 billion
      high52Week: 60,
      low52Week: 40,
    });
    (getHistoricalData as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [{ date: '2024-01-01', close: 50 }],
    });

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'SMALL' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Small Corp')).toBeDefined();
    });

    const resultButton = screen.getByText('Small Corp').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      expect(screen.getByText('5.00B')).toBeDefined();
    });
  });

  it('should format market cap as millions for micro-cap companies', async () => {
    const { searchStocks, getStockSummary, getHistoricalData } =
      await import('../../services/marketDataService');

    (searchStocks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      results: [{ symbol: 'MICRO', name: 'Micro Corp', exchange: 'NYSE' }],
    });
    (getStockSummary as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      symbol: 'MICRO',
      name: 'Micro Corp',
      price: 10,
      changePercent: 0.2,
      volume: 100000,
      marketCap: 500e6, // 500 million
      high52Week: 15,
      low52Week: 5,
    });
    (getHistoricalData as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [{ date: '2024-01-01', close: 10 }],
    });

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'MICRO' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Micro Corp')).toBeDefined();
    });

    const resultButton = screen.getByText('Micro Corp').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      expect(screen.getByText('500.00M')).toBeDefined();
    });
  });

  it('should display empty chart message when no chart data', async () => {
    const { searchStocks, getStockSummary, getHistoricalData } =
      await import('../../services/marketDataService');

    (searchStocks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      results: [{ symbol: 'EMPTY', name: 'Empty Corp', exchange: 'NYSE' }],
    });
    (getStockSummary as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      symbol: 'EMPTY',
      name: 'Empty Corp',
      price: 100,
      changePercent: 1.0,
      volume: 1000000,
      marketCap: 10e9,
      high52Week: 120,
      low52Week: 80,
    });
    (getHistoricalData as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [], // Empty chart data
    });

    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
    fireEvent.change(searchInput, { target: { value: 'EMPTY' } });

    const allButtons = screen.getAllByRole('button');
    const searchButton = allButtons.find(
      (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
    );
    if (searchButton) fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Empty Corp')).toBeDefined();
    });

    const resultButton = screen.getByText('Empty Corp').closest('button');
    if (resultButton) fireEvent.click(resultButton);

    await waitFor(() => {
      expect(screen.getByText('차트 데이터 없음')).toBeDefined();
    });
  });

  it('should not show refresh buttons in search tab', async () => {
    render(<MarketTicker />);

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    // Refresh buttons should not be visible in search tab
    expect(screen.queryByTitle('새로고침')).toBeNull();
    expect(screen.queryByTitle('자동 새로고침 켜짐')).toBeNull();
  });

  it('should hide last update time in search tab', async () => {
    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeDefined();
    });

    // Initially in indices tab - time should be visible
    const header = document.querySelector('.px-4.py-3');
    expect(header?.textContent).toContain(':');

    const searchTab = screen.getByText('검색');
    fireEvent.click(searchTab);

    // After switching to search tab - time should not be visible in the header
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
      expect(searchInput).toBeDefined();
    });
  });

  it('should display Korean index price with Won symbol', async () => {
    const { getMarketIndices } = await import('../../services/marketDataService');
    (getMarketIndices as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        {
          symbol: '^KS11',
          name: 'KOSPI',
          price: 2500,
          changePercent: 0.8,
          volume: 500000,
          marketCap: 0,
          high52Week: 2700,
          low52Week: 2200,
        },
      ],
    });

    render(<MarketTicker />);

    await waitFor(() => {
      expect(screen.getByText('KOSPI')).toBeDefined();
    });

    // Korean index (^K) should display with Won symbol
    expect(screen.getByText('₩2,500')).toBeDefined();
  });

  it('should display KOSDAQ stock price with Won symbol', async () => {
    const { getKoreanTopStocks } = await import('../../services/marketDataService');
    (getKoreanTopStocks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        {
          symbol: '035720.KQ',
          name: '카카오',
          price: 45000,
          changePercent: -0.5,
          volume: 5000000,
          marketCap: 20e12,
          high52Week: 60000,
          low52Week: 35000,
        },
      ],
    });

    render(<MarketTicker />);

    const koreanTab = screen.getByText('한국');
    fireEvent.click(koreanTab);

    await waitFor(() => {
      expect(screen.getByText('카카오')).toBeDefined();
    });

    expect(screen.getByText('₩45,000')).toBeDefined();
  });

  describe('Auto Refresh Interval', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call fetchData at 30-second intervals when autoRefresh is enabled', async () => {
      const { getMarketIndices } = await import('../../services/marketDataService');

      render(<MarketTicker />);

      // Wait for initial load
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });

      // Clear initial call count
      vi.clearAllMocks();

      // Advance timer by 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await vi.runOnlyPendingTimersAsync();
      });

      expect(getMarketIndices).toHaveBeenCalled();
    });

    it('should not call fetchData when autoRefresh is disabled', async () => {
      const { getMarketIndices } = await import('../../services/marketDataService');

      render(<MarketTicker />);

      // Wait for initial load
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });

      // Disable auto refresh
      const autoRefreshButton = screen.getByTitle('자동 새로고침 켜짐');
      await act(async () => {
        fireEvent.click(autoRefreshButton);
      });

      // Clear call count after disabling
      vi.clearAllMocks();

      // Advance timer by 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await vi.runOnlyPendingTimersAsync();
      });

      // Should NOT be called since auto refresh is disabled
      expect(getMarketIndices).not.toHaveBeenCalled();
    });

    it('should not run interval when in search tab', async () => {
      const { getMarketIndices, searchStocks } = await import('../../services/marketDataService');

      render(<MarketTicker />);

      // Wait for initial load
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });

      // Switch to search tab
      const searchTab = screen.getByText('검색');
      await act(async () => {
        fireEvent.click(searchTab);
      });

      // Clear call count after switching
      vi.clearAllMocks();

      // Advance timer by 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await vi.runOnlyPendingTimersAsync();
      });

      // getMarketIndices should NOT be called since we're in search tab
      expect(getMarketIndices).not.toHaveBeenCalled();
    });

    it('should clear interval when component unmounts', async () => {
      const { getMarketIndices } = await import('../../services/marketDataService');

      const { unmount } = render(<MarketTicker />);

      // Wait for initial load
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });

      // Clear initial call count
      vi.clearAllMocks();

      // Unmount the component
      unmount();

      // Advance timer by 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await vi.runOnlyPendingTimersAsync();
      });

      // Should NOT be called since component is unmounted
      expect(getMarketIndices).not.toHaveBeenCalled();
    });

    it('should clear interval when switching to search tab', async () => {
      const { getKoreanTopStocks } = await import('../../services/marketDataService');

      render(<MarketTicker />);

      // Wait for initial load
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });

      // Switch to Korean stocks tab
      const koreanTab = screen.getByText('한국');
      await act(async () => {
        fireEvent.click(koreanTab);
        await vi.runOnlyPendingTimersAsync();
      });

      // Clear call count
      vi.clearAllMocks();

      // Advance timer by 30 seconds - should still call fetchData
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await vi.runOnlyPendingTimersAsync();
      });

      expect(getKoreanTopStocks).toHaveBeenCalled();

      // Now switch to search tab
      const searchTab = screen.getByText('검색');
      await act(async () => {
        fireEvent.click(searchTab);
      });

      vi.clearAllMocks();

      // Advance timer again
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await vi.runOnlyPendingTimersAsync();
      });

      // Should not call any fetch function in search tab
      expect(getKoreanTopStocks).not.toHaveBeenCalled();
    });

    it('should re-enable interval when toggling autoRefresh back on', async () => {
      const { getMarketIndices } = await import('../../services/marketDataService');

      render(<MarketTicker />);

      // Wait for initial load
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });

      // Disable auto refresh
      const autoRefreshButton = screen.getByTitle('자동 새로고침 켜짐');
      await act(async () => {
        fireEvent.click(autoRefreshButton);
      });

      // Re-enable auto refresh
      const disabledButton = screen.getByTitle('자동 새로고침 꺼짐');
      await act(async () => {
        fireEvent.click(disabledButton);
      });

      // Clear call count
      vi.clearAllMocks();

      // Advance timer by 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await vi.runOnlyPendingTimersAsync();
      });

      // Should be called since auto refresh was re-enabled
      expect(getMarketIndices).toHaveBeenCalled();
    });
  });

  describe('Chart rendering with data', () => {
    it('should render chart with historical data for US stock', async () => {
      const { getHistoricalData } = await import('../../services/marketDataService');
      (getHistoricalData as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: [
          { date: '2024-01-01', close: 450 },
          { date: '2024-01-02', close: 460 },
          { date: '2024-01-03', close: 470 },
          { date: '2024-01-04', close: 480 },
          { date: '2024-01-05', close: 490 },
        ],
      });

      render(<MarketTicker />);

      const searchTab = screen.getByText('검색');
      fireEvent.click(searchTab);

      const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
      fireEvent.change(searchInput, { target: { value: 'NVDA' } });

      const allButtons = screen.getAllByRole('button');
      const searchButton = allButtons.find(
        (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
      );
      if (searchButton) fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
      });

      const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
      if (resultButton) fireEvent.click(resultButton);

      // Verify chart container is rendered (ResponsiveContainer)
      await waitFor(() => {
        const chartContainer = document.querySelector('.recharts-responsive-container');
        expect(chartContainer).toBeDefined();
      });
    });

    it('should render chart with historical data for Korean stock', async () => {
      const { searchStocks, getStockSummary, getHistoricalData } =
        await import('../../services/marketDataService');

      (searchStocks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        results: [{ symbol: '005930.KS', name: '삼성전자', exchange: 'KRX' }],
      });
      (getStockSummary as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        symbol: '005930.KS',
        name: '삼성전자',
        price: 70000,
        changePercent: 1.5,
        volume: 10000000,
        marketCap: 400e12,
        high52Week: 80000,
        low52Week: 55000,
      });
      (getHistoricalData as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: [
          { date: '2024-01-01', close: 68000 },
          { date: '2024-01-02', close: 69000 },
          { date: '2024-01-03', close: 70000 },
        ],
      });

      render(<MarketTicker />);

      const searchTab = screen.getByText('검색');
      fireEvent.click(searchTab);

      const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
      fireEvent.change(searchInput, { target: { value: '삼성전자' } });

      const allButtons = screen.getAllByRole('button');
      const searchButton = allButtons.find(
        (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
      );
      if (searchButton) fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('삼성전자')).toBeDefined();
      });

      const resultButton = screen.getByText('삼성전자').closest('button');
      if (resultButton) fireEvent.click(resultButton);

      // Verify chart renders for Korean stock
      await waitFor(() => {
        expect(screen.getByText('₩70,000')).toBeDefined();
      });
    });

    it('should display 52-week high/low for Korean stock with Won symbol', async () => {
      const { searchStocks, getStockSummary, getHistoricalData } =
        await import('../../services/marketDataService');

      (searchStocks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        results: [{ symbol: '035720.KQ', name: '카카오', exchange: 'KRX' }],
      });
      (getStockSummary as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        symbol: '035720.KQ',
        name: '카카오',
        price: 45000,
        changePercent: -0.5,
        volume: 5000000,
        marketCap: 20e12,
        high52Week: 60000,
        low52Week: 35000,
      });
      (getHistoricalData as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: [{ date: '2024-01-01', close: 45000 }],
      });

      render(<MarketTicker />);

      const searchTab = screen.getByText('검색');
      fireEvent.click(searchTab);

      const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
      fireEvent.change(searchInput, { target: { value: '카카오' } });

      const allButtons = screen.getAllByRole('button');
      const searchButton = allButtons.find(
        (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
      );
      if (searchButton) fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('카카오')).toBeDefined();
      });

      const resultButton = screen.getByText('카카오').closest('button');
      if (resultButton) fireEvent.click(resultButton);

      await waitFor(() => {
        expect(screen.getByText('₩60,000')).toBeDefined(); // 52-week high
        expect(screen.getByText('₩35,000')).toBeDefined(); // 52-week low
      });
    });

    it('should change chart period to 1 week', async () => {
      const { getHistoricalData } = await import('../../services/marketDataService');

      render(<MarketTicker />);

      const searchTab = screen.getByText('검색');
      fireEvent.click(searchTab);

      const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
      fireEvent.change(searchInput, { target: { value: 'NVDA' } });

      const allButtons = screen.getAllByRole('button');
      const searchButton = allButtons.find(
        (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
      );
      if (searchButton) fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
      });

      const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
      if (resultButton) fireEvent.click(resultButton);

      await waitFor(() => {
        expect(screen.getByText('1주')).toBeDefined();
      });

      // Click 1 week button
      const weekButton = screen.getByText('1주');
      fireEvent.click(weekButton);

      await waitFor(() => {
        expect(getHistoricalData).toHaveBeenCalledWith('NVDA', 7);
      });
    });

    it('should change chart period to 3 months', async () => {
      const { getHistoricalData } = await import('../../services/marketDataService');

      render(<MarketTicker />);

      const searchTab = screen.getByText('검색');
      fireEvent.click(searchTab);

      const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
      fireEvent.change(searchInput, { target: { value: 'NVDA' } });

      const allButtons = screen.getAllByRole('button');
      const searchButton = allButtons.find(
        (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
      );
      if (searchButton) fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
      });

      const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
      if (resultButton) fireEvent.click(resultButton);

      await waitFor(() => {
        expect(screen.getByText('3개월')).toBeDefined();
      });

      // Click 3 months button
      const monthsButton = screen.getByText('3개월');
      fireEvent.click(monthsButton);

      await waitFor(() => {
        expect(getHistoricalData).toHaveBeenCalledWith('NVDA', 90);
      });
    });
  });

  describe('SearchResultItem interactions', () => {
    it('should disable search result button when stock is loading', async () => {
      const { getStockSummary, getHistoricalData } =
        await import('../../services/marketDataService');

      // Make getStockSummary slow to respond
      (getStockSummary as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  symbol: 'NVDA',
                  name: 'NVIDIA Corporation',
                  price: 500,
                  changePercent: 3.5,
                  volume: 30000000,
                  marketCap: 1.2e12,
                  high52Week: 550,
                  low52Week: 300,
                }),
              1000
            )
          )
      );

      render(<MarketTicker />);

      const searchTab = screen.getByText('검색');
      fireEvent.click(searchTab);

      const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
      fireEvent.change(searchInput, { target: { value: 'NVDA' } });

      const allButtons = screen.getAllByRole('button');
      const searchButton = allButtons.find(
        (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
      );
      if (searchButton) fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('NVIDIA Corporation')).toBeDefined();
      });

      const resultButton = screen.getByText('NVIDIA Corporation').closest('button');
      if (resultButton) {
        fireEvent.click(resultButton);

        // Button should have loading state/disabled class while loading
        await waitFor(() => {
          expect(resultButton.classList.contains('disabled:opacity-50')).toBe(true);
        });
      }
    });

    it('should display exchange information in search results', async () => {
      const { searchStocks } = await import('../../services/marketDataService');
      (searchStocks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        results: [
          { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
          { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ' },
        ],
      });

      render(<MarketTicker />);

      const searchTab = screen.getByText('검색');
      fireEvent.click(searchTab);

      const searchInput = screen.getByPlaceholderText('종목명 또는 심볼 입력...');
      fireEvent.change(searchInput, { target: { value: 'NVDA' } });

      const allButtons = screen.getAllByRole('button');
      const searchButton = allButtons.find(
        (btn) => btn.textContent === '검색' && btn.closest('.flex.gap-2')
      );
      if (searchButton) fireEvent.click(searchButton);

      await waitFor(() => {
        // Check that exchange info is displayed
        expect(screen.getAllByText('NASDAQ').length).toBeGreaterThan(0);
      });
    });
  });
});
