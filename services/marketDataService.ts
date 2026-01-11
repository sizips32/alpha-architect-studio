/**
 * 프론트엔드용 시장 데이터 서비스
 * Yahoo Finance API와 연동된 백엔드 API를 호출합니다.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

/**
 * 주식 요약 정보 타입
 */
export interface StockSummary {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number | null;
  eps: number | null;
  high52Week: number;
  low52Week: number;
}

/**
 * 과거 주가 데이터 타입
 */
export interface MarketData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

/**
 * 지표가 포함된 주가 데이터 타입
 */
export interface MarketDataWithIndicators extends MarketData {
  returns: number;
  volatility20: number;
  sma20: number;
  sma50: number;
}

/**
 * 검색 결과 타입
 */
export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

/**
 * 개별 종목 요약 정보 조회
 */
export async function getStockSummary(symbol: string): Promise<StockSummary> {
  const response = await fetch(`${API_URL}/api/stock/${encodeURIComponent(symbol)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '종목 정보를 가져오는데 실패했습니다.');
  }
  return response.json();
}

/**
 * 과거 주가 데이터 조회
 */
export async function getHistoricalData(
  symbol: string,
  days: number = 252,
  withIndicators: boolean = false
): Promise<{
  symbol: string;
  days: number;
  count: number;
  data: MarketData[] | MarketDataWithIndicators[];
}> {
  const params = new URLSearchParams({
    days: days.toString(),
    ...(withIndicators && { indicators: 'true' }),
  });
  const response = await fetch(`${API_URL}/api/historical/${encodeURIComponent(symbol)}?${params}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '과거 데이터를 가져오는데 실패했습니다.');
  }
  return response.json();
}

/**
 * 종목 검색
 */
export async function searchStocks(
  query: string
): Promise<{ query: string; count: number; results: SearchResult[] }> {
  const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '검색에 실패했습니다.');
  }
  return response.json();
}

/**
 * 주요 지수 조회
 */
export async function getMarketIndices(): Promise<{ count: number; data: StockSummary[] }> {
  const response = await fetch(`${API_URL}/api/indices`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '지수 정보를 가져오는데 실패했습니다.');
  }
  return response.json();
}

/**
 * 한국 주요 종목 조회
 */
export async function getKoreanTopStocks(): Promise<{ count: number; data: StockSummary[] }> {
  const response = await fetch(`${API_URL}/api/korean-stocks`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '한국 종목 정보를 가져오는데 실패했습니다.');
  }
  return response.json();
}

/**
 * 미국 기술주 조회
 */
export async function getUSTechStocks(): Promise<{ count: number; data: StockSummary[] }> {
  const response = await fetch(`${API_URL}/api/us-tech-stocks`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '미국 기술주 정보를 가져오는데 실패했습니다.');
  }
  return response.json();
}

/**
 * 여러 종목 시세 조회
 */
export async function getMultipleQuotes(
  symbols: string[]
): Promise<{ requested: number; received: number; data: StockSummary[] }> {
  const response = await fetch(`${API_URL}/api/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '시세 정보를 가져오는데 실패했습니다.');
  }
  return response.json();
}

/**
 * API 서버 상태 확인
 */
export async function checkApiHealth(): Promise<{
  status: string;
  timestamp: string;
  endpoints: string[];
}> {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) {
    throw new Error('API 서버에 연결할 수 없습니다.');
  }
  return response.json();
}
