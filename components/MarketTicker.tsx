import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  getMarketIndices,
  getKoreanTopStocks,
  getUSTechStocks,
  searchStocks,
  getStockSummary,
  getHistoricalData,
  type StockSummary,
  type SearchResult,
  type MarketData,
} from '../services/marketDataService';

type TabType = 'indices' | 'korean' | 'usTech' | 'search';

interface TickerItemProps {
  stock: StockSummary;
}

const TickerItem: React.FC<TickerItemProps> = ({ stock }) => {
  const isPositive = stock.changePercent >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const bgColor = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes('.KS') || symbol.includes('.KQ') || symbol.startsWith('^K')) {
      return `₩${price.toLocaleString()}`;
    }
    if (symbol.startsWith('^')) {
      return price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${bgColor} hover:bg-gray-800/50 transition-colors`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white truncate">{stock.name}</span>
          <span className="text-xs text-gray-500">{stock.symbol}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <span className="font-mono text-white">{formatPrice(stock.price, stock.symbol)}</span>
        <div className={`flex items-center gap-1 ${changeColor}`}>
          {isPositive ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
          <span className="font-mono text-sm">
            {isPositive ? '+' : ''}
            {stock.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};

interface SearchResultItemProps {
  result: SearchResult;
  onSelect: (symbol: string) => void;
  isLoading: boolean;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, onSelect, isLoading }) => (
  <button
    onClick={() => onSelect(result.symbol)}
    disabled={isLoading}
    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/60 transition-colors text-left disabled:opacity-50"
  >
    <div className="flex-1 min-w-0">
      <div className="font-medium text-white truncate">{result.name}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-cyan-400 font-mono">{result.symbol}</span>
        <span className="text-xs text-gray-500">{result.exchange}</span>
      </div>
    </div>
    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-8">
    <svg className="w-8 h-8 text-cyan-500 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
);

const SmallSpinner: React.FC = () => (
  <svg className="w-4 h-4 text-cyan-500 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const MarketTicker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('indices');
  const [data, setData] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockSummary | null>(null);
  const [stockLoading, setStockLoading] = useState(false);

  // Chart state
  const [chartData, setChartData] = useState<MarketData[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<number>(30);

  const fetchData = useCallback(async () => {
    if (activeTab === 'search') return;

    try {
      setError(null);
      let result: { data: StockSummary[] };

      switch (activeTab) {
        case 'indices':
          result = await getMarketIndices();
          break;
        case 'korean':
          result = await getKoreanTopStocks();
          break;
        case 'usTech':
          result = await getUSTechStocks();
          break;
        default:
          return;
      }

      setData(result.data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'search') {
      setLoading(true);
      fetchData();
    }
  }, [fetchData, activeTab]);

  useEffect(() => {
    if (!autoRefresh || activeTab === 'search') return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData, activeTab]);

  // Search functionality
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setError(null);
    setSelectedStock(null);

    try {
      const result = await searchStocks(searchQuery.trim());
      setSearchResults(result.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색에 실패했습니다.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  const handleSelectStock = useCallback(
    async (symbol: string) => {
      setStockLoading(true);
      setChartLoading(true);
      setError(null);
      setChartData([]);

      try {
        const [stock, historical] = await Promise.all([
          getStockSummary(symbol),
          getHistoricalData(symbol, chartPeriod),
        ]);
        setSelectedStock(stock);
        setChartData(historical.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '종목 정보를 가져오는데 실패했습니다.');
      } finally {
        setStockLoading(false);
        setChartLoading(false);
      }
    },
    [chartPeriod]
  );

  const handlePeriodChange = useCallback(
    async (days: number) => {
      if (!selectedStock) return;
      setChartPeriod(days);
      setChartLoading(true);

      try {
        const historical = await getHistoricalData(selectedStock.symbol, days);
        setChartData(historical.data);
      } catch (err) {
        console.error('Failed to load chart data:', err);
      } finally {
        setChartLoading(false);
      }
    },
    [selectedStock]
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const tabs: { id: TabType; label: string; icon?: React.ReactNode }[] = [
    { id: 'indices', label: '지수' },
    { id: 'korean', label: '한국' },
    { id: 'usTech', label: '미국' },
    {
      id: 'search',
      label: '검색',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
  ];

  const renderSearchContent = () => {
    if (selectedStock) {
      const isPositive = selectedStock.changePercent >= 0;
      return (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedStock(null)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            검색 결과로 돌아가기
          </button>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-white">{selectedStock.name}</h4>
                <span className="text-sm text-cyan-400 font-mono">{selectedStock.symbol}</span>
              </div>
              <div className={`text-right ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                <div className="text-xl font-bold">
                  {selectedStock.symbol.includes('.KS') || selectedStock.symbol.includes('.KQ')
                    ? `₩${selectedStock.price.toLocaleString()}`
                    : `$${selectedStock.price.toFixed(2)}`}
                </div>
                <div className="text-sm">
                  {isPositive ? '+' : ''}
                  {selectedStock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Chart Period Buttons */}
            <div className="flex gap-2 mb-3">
              {[
                { days: 7, label: '1주' },
                { days: 30, label: '1개월' },
                { days: 90, label: '3개월' },
                { days: 365, label: '1년' },
              ].map((period) => (
                <button
                  key={period.days}
                  onClick={() => handlePeriodChange(period.days)}
                  disabled={chartLoading}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                    chartPeriod === period.days
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } disabled:opacity-50`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* Price Chart */}
            <div className="h-40 mb-4">
              {chartLoading ? (
                <div className="flex items-center justify-center h-full bg-gray-900/50 rounded">
                  <SmallSpinner />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={isPositive ? '#10B981' : '#EF4444'}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={isPositive ? '#10B981' : '#EF4444'}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(value) =>
                        selectedStock.symbol.includes('.KS') || selectedStock.symbol.includes('.KQ')
                          ? `₩${(value / 1000).toFixed(0)}k`
                          : `$${value.toFixed(0)}`
                      }
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value: number) => [
                        selectedStock.symbol.includes('.KS') || selectedStock.symbol.includes('.KQ')
                          ? `₩${value.toLocaleString()}`
                          : `$${value.toFixed(2)}`,
                        '종가',
                      ]}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString('ko-KR');
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke={isPositive ? '#10B981' : '#EF4444'}
                      strokeWidth={2}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-900/50 rounded text-gray-500 text-sm">
                  차트 데이터 없음
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-900/50 rounded p-2">
                <div className="text-gray-500">거래량</div>
                <div className="text-white font-mono">{selectedStock.volume.toLocaleString()}</div>
              </div>
              <div className="bg-gray-900/50 rounded p-2">
                <div className="text-gray-500">시가총액</div>
                <div className="text-white font-mono">
                  {selectedStock.marketCap > 1e12
                    ? `${(selectedStock.marketCap / 1e12).toFixed(2)}T`
                    : selectedStock.marketCap > 1e9
                      ? `${(selectedStock.marketCap / 1e9).toFixed(2)}B`
                      : `${(selectedStock.marketCap / 1e6).toFixed(2)}M`}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded p-2">
                <div className="text-gray-500">52주 최고</div>
                <div className="text-white font-mono">
                  {selectedStock.symbol.includes('.KS') || selectedStock.symbol.includes('.KQ')
                    ? `₩${selectedStock.high52Week.toLocaleString()}`
                    : `$${selectedStock.high52Week.toFixed(2)}`}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded p-2">
                <div className="text-gray-500">52주 최저</div>
                <div className="text-white font-mono">
                  {selectedStock.symbol.includes('.KS') || selectedStock.symbol.includes('.KQ')
                    ? `₩${selectedStock.low52Week.toLocaleString()}`
                    : `$${selectedStock.low52Week.toFixed(2)}`}
                </div>
              </div>
              {selectedStock.pe && (
                <div className="bg-gray-900/50 rounded p-2">
                  <div className="text-gray-500">PER</div>
                  <div className="text-white font-mono">{selectedStock.pe.toFixed(2)}</div>
                </div>
              )}
              {selectedStock.eps && (
                <div className="bg-gray-900/50 rounded p-2">
                  <div className="text-gray-500">EPS</div>
                  <div className="text-white font-mono">{selectedStock.eps.toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="종목명 또는 심볼 입력..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pl-9 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            disabled={searchLoading || !searchQuery.trim()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {searchLoading ? <SmallSpinner /> : '검색'}
          </button>
        </div>

        {/* Search Results */}
        {searchLoading ? (
          <LoadingSpinner />
        ) : searchResults.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 mb-2">{searchResults.length}개 결과</div>
            {searchResults.map((result) => (
              <SearchResultItem
                key={result.symbol}
                result={result}
                onSelect={handleSelectStock}
                isLoading={stockLoading}
              />
            ))}
          </div>
        ) : searchQuery && !searchLoading ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p>종목명 또는 심볼을 검색하세요</p>
            <p className="text-xs mt-1">예: 삼성전자, AAPL, NVDA</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-cyan-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          <h3 className="font-bold text-white">실시간 시세</h3>
          {lastUpdate && activeTab !== 'search' && (
            <span className="text-xs text-gray-500">{lastUpdate.toLocaleTimeString('ko-KR')}</span>
          )}
        </div>
        {activeTab !== 'search' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-1.5 rounded transition-colors ${
                autoRefresh ? 'text-cyan-400 bg-cyan-500/20' : 'text-gray-500 hover:text-gray-300'
              }`}
              title={autoRefresh ? '자동 새로고침 켜짐' : '자동 새로고침 꺼짐'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
              disabled={loading}
              className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              title="새로고침"
            >
              <svg
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              activeTab === tab.id
                ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'search' ? (
          renderSearchContent()
        ) : loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
              className="text-sm text-cyan-400 hover:underline"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((stock) => (
              <TickerItem key={stock.symbol} stock={stock} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketTicker;
