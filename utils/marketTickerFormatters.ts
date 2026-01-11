/**
 * MarketTicker formatter utilities
 * Extracted for testability
 */

/**
 * Check if a symbol is a Korean stock
 */
export const isKoreanStock = (symbol: string): boolean => {
  return symbol.includes('.KS') || symbol.includes('.KQ') || symbol.startsWith('^K');
};

/**
 * Check if a symbol is a market index (starts with ^)
 */
export const isMarketIndex = (symbol: string): boolean => {
  return symbol.startsWith('^');
};

/**
 * Format price based on stock symbol (Korean vs US)
 * Korean stocks: ₩ with no decimals
 * US stocks: $ with 2 decimals
 * Market indices: No currency symbol, 2 decimals
 */
export const formatPrice = (price: number, symbol: string): string => {
  if (isKoreanStock(symbol)) {
    return `₩${price.toLocaleString()}`;
  }
  if (isMarketIndex(symbol)) {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format price for display in detailed view
 * Korean stocks: ₩ with no decimals
 * US stocks: $ with 2 decimals
 */
export const formatDetailPrice = (price: number, symbol: string): string => {
  if (symbol.includes('.KS') || symbol.includes('.KQ')) {
    return `₩${price.toLocaleString()}`;
  }
  return `$${price.toFixed(2)}`;
};

/**
 * Format change percentage with sign
 */
export const formatChangePercent = (changePercent: number): string => {
  const sign = changePercent >= 0 ? '+' : '';
  return `${sign}${changePercent.toFixed(2)}%`;
};

/**
 * Format date for X axis in chart (MM/DD format)
 */
export const formatChartXAxis = (dateValue: string): string => {
  const date = new Date(dateValue);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * Format price for Y axis in chart
 * Korean stocks: ₩ with k suffix (thousands)
 * US stocks: $ with no decimals
 */
export const formatChartYAxis = (value: number, symbol: string): string => {
  if (symbol.includes('.KS') || symbol.includes('.KQ')) {
    return `₩${(value / 1000).toFixed(0)}k`;
  }
  return `$${value.toFixed(0)}`;
};

/**
 * Format price for tooltip in chart
 * Korean stocks: ₩ with locale string
 * US stocks: $ with 2 decimals
 */
export const formatChartTooltipPrice = (value: number, symbol: string): string => {
  if (symbol.includes('.KS') || symbol.includes('.KQ')) {
    return `₩${value.toLocaleString()}`;
  }
  return `$${value.toFixed(2)}`;
};

/**
 * Format date for tooltip label (Korean locale)
 */
export const formatChartTooltipDate = (dateValue: string): string => {
  const date = new Date(dateValue);
  return date.toLocaleDateString('ko-KR');
};

/**
 * Format market cap with appropriate suffix (T, B, M)
 * T = Trillion, B = Billion, M = Million
 */
export const formatMarketCap = (marketCap: number): string => {
  if (marketCap > 1e12) {
    return `${(marketCap / 1e12).toFixed(2)}T`;
  }
  if (marketCap > 1e9) {
    return `${(marketCap / 1e9).toFixed(2)}B`;
  }
  return `${(marketCap / 1e6).toFixed(2)}M`;
};

/**
 * Format volume with locale string
 */
export const formatVolume = (volume: number): string => {
  return volume.toLocaleString();
};

/**
 * Format 52-week high/low price
 */
export const format52WeekPrice = (price: number, symbol: string): string => {
  if (symbol.includes('.KS') || symbol.includes('.KQ')) {
    return `₩${price.toLocaleString()}`;
  }
  return `$${price.toFixed(2)}`;
};

/**
 * Format PE ratio
 */
export const formatPE = (pe: number): string => {
  return pe.toFixed(2);
};

/**
 * Format EPS
 */
export const formatEPS = (eps: number): string => {
  return eps.toFixed(2);
};

/**
 * Get color class based on positive/negative change
 */
export const getChangeColorClass = (changePercent: number): string => {
  return changePercent >= 0 ? 'text-green-400' : 'text-red-400';
};

/**
 * Get background color class based on positive/negative change
 */
export const getChangeBgClass = (changePercent: number): string => {
  return changePercent >= 0 ? 'bg-green-500/10' : 'bg-red-500/10';
};

/**
 * Get chart color based on positive/negative change
 */
export const getChartColor = (isPositive: boolean): string => {
  return isPositive ? '#10B981' : '#EF4444';
};

/**
 * Format time for last update display (Korean locale)
 */
export const formatLastUpdate = (date: Date): string => {
  return date.toLocaleTimeString('ko-KR');
};
