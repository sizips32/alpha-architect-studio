/* eslint-disable @typescript-eslint/no-explicit-any */
import YahooFinance from 'yahoo-finance2';

// yahoo-finance2 v3 requires instantiation
const yahooFinance = new YahooFinance();

/**
 * 주식 시장 데이터 타입
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
 * 검색 결과 타입
 */
export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

/**
 * Yahoo Finance에서 과거 주가 데이터 조회
 * @param symbol - 종목 심볼 (예: AAPL, 005930.KS)
 * @param days - 조회할 일수 (기본값: 252 = 1년)
 * @returns 과거 주가 데이터 배열
 */
export async function fetchHistoricalData(
  symbol: string,
  days: number = 252
): Promise<MarketData[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const result: any[] = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
    });

    return result.map((item: any) => ({
      date: item.date.toISOString().split('T')[0],
      open: item.open ?? 0,
      high: item.high ?? 0,
      low: item.low ?? 0,
      close: item.close ?? 0,
      volume: item.volume ?? 0,
      adjClose: item.adjClose ?? item.close ?? 0,
    }));
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw new Error(`종목 ${symbol}의 데이터를 가져오는데 실패했습니다.`);
  }
}

/**
 * Yahoo Finance에서 주식 요약 정보 조회
 * @param symbol - 종목 심볼
 * @returns 주식 요약 정보
 */
export async function fetchStockSummary(symbol: string): Promise<StockSummary> {
  try {
    const quote: any = await yahooFinance.quote(symbol);

    return {
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || symbol,
      price: quote.regularMarketPrice ?? 0,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      volume: quote.regularMarketVolume ?? 0,
      marketCap: quote.marketCap ?? 0,
      pe: quote.trailingPE ?? null,
      eps: quote.epsTrailingTwelveMonths ?? null,
      high52Week: quote.fiftyTwoWeekHigh ?? 0,
      low52Week: quote.fiftyTwoWeekLow ?? 0,
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw new Error(`종목 ${symbol}의 요약 정보를 가져오는데 실패했습니다.`);
  }
}

/**
 * 여러 종목의 실시간 시세 조회
 * @param symbols - 종목 심볼 배열
 * @returns 주식 요약 정보 배열
 */
export async function fetchMultipleQuotes(symbols: string[]): Promise<StockSummary[]> {
  try {
    const results = await Promise.allSettled(symbols.map((symbol) => fetchStockSummary(symbol)));

    return results
      .filter(
        (result): result is PromiseFulfilledResult<StockSummary> => result.status === 'fulfilled'
      )
      .map((result) => result.value);
  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    throw new Error('여러 종목의 시세를 가져오는데 실패했습니다.');
  }
}

/**
 * 종목 검색
 * @param query - 검색어 (종목명 또는 심볼)
 * @returns 검색 결과 배열
 */
export async function searchStocks(query: string): Promise<SearchResult[]> {
  try {
    const result: any = await yahooFinance.search(query);

    return result.quotes
      .filter((item: any) => item.quoteType === 'EQUITY')
      .map((item: any) => ({
        symbol: item.symbol,
        name: item.shortname || item.longname || item.symbol,
        type: item.quoteType || 'EQUITY',
        exchange: item.exchange || '',
      }));
  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    throw new Error(`"${query}" 검색에 실패했습니다.`);
  }
}

/**
 * 주요 지수 데이터 조회
 * @returns 주요 지수 정보
 */
export async function fetchMarketIndices(): Promise<StockSummary[]> {
  const indices = [
    '^GSPC', // S&P 500
    '^DJI', // Dow Jones
    '^IXIC', // NASDAQ
    '^KS11', // KOSPI
    '^KQ11', // KOSDAQ
  ];

  return fetchMultipleQuotes(indices);
}

/**
 * 한국 주요 종목 데이터 조회
 * @returns 한국 주요 종목 정보
 */
export async function fetchKoreanTopStocks(): Promise<StockSummary[]> {
  const koreanStocks = [
    '005930.KS', // 삼성전자
    '000660.KS', // SK하이닉스
    '035420.KS', // NAVER
    '035720.KS', // 카카오
    '051910.KS', // LG화학
    '006400.KS', // 삼성SDI
    '068270.KS', // 셀트리온
    '005380.KS', // 현대차
    '000270.KS', // 기아
    '207940.KS', // 삼성바이오로직스
  ];

  return fetchMultipleQuotes(koreanStocks);
}

/**
 * 미국 주요 기술주 데이터 조회
 * @returns 미국 기술주 정보
 */
export async function fetchUSTechStocks(): Promise<StockSummary[]> {
  const techStocks = [
    'AAPL', // Apple
    'MSFT', // Microsoft
    'GOOGL', // Alphabet
    'AMZN', // Amazon
    'NVDA', // NVIDIA
    'META', // Meta
    'TSLA', // Tesla
    'AMD', // AMD
    'NFLX', // Netflix
    'CRM', // Salesforce
  ];

  return fetchMultipleQuotes(techStocks);
}

/**
 * 백테스트용 데이터 계산 (수익률, 변동성 등)
 * @param data - 과거 주가 데이터
 * @returns 계산된 지표가 추가된 데이터
 */
export function calculateIndicators(data: MarketData[]): (MarketData & {
  returns: number;
  volatility20: number;
  sma20: number;
  sma50: number;
})[] {
  if (data.length < 50) {
    throw new Error('지표 계산에 최소 50일의 데이터가 필요합니다.');
  }

  return data.map((item, index) => {
    // 일간 수익률
    const returns = index > 0 ? (item.close - data[index - 1].close) / data[index - 1].close : 0;

    // 20일 변동성
    let volatility20 = 0;
    if (index >= 20) {
      const returns20 = [];
      for (let i = index - 19; i <= index; i++) {
        if (i > 0) {
          returns20.push((data[i].close - data[i - 1].close) / data[i - 1].close);
        }
      }
      const mean = returns20.reduce((a, b) => a + b, 0) / returns20.length;
      volatility20 = Math.sqrt(
        returns20.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns20.length
      );
    }

    // 20일 이동평균
    let sma20 = 0;
    if (index >= 19) {
      for (let i = index - 19; i <= index; i++) {
        sma20 += data[i].close;
      }
      sma20 /= 20;
    }

    // 50일 이동평균
    let sma50 = 0;
    if (index >= 49) {
      for (let i = index - 49; i <= index; i++) {
        sma50 += data[i].close;
      }
      sma50 /= 50;
    }

    return {
      ...item,
      returns,
      volatility20,
      sma20,
      sma50,
    };
  });
}
