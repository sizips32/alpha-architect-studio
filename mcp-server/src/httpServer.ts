#!/usr/bin/env node

// Load environment variables from .env file
import 'dotenv/config';

import http from 'http';
import { parse } from 'url';
import { z } from 'zod';
import { generateAlphaExpression } from './services/geminiService.js';
import {
  fetchHistoricalData,
  fetchStockSummary,
  fetchMultipleQuotes,
  searchStocks,
  fetchMarketIndices,
  fetchKoreanTopStocks,
  fetchUSTechStocks,
  calculateIndicators,
} from './services/marketDataService.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;

function sendJson(res: http.ServerResponse, status: number, data: unknown) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function handleOptions(res: http.ServerResponse) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end();
}

// Reuse the MCP simulate_backtest input shape
const ConfigSchema = z
  .object({
    universe: z.string().optional(),
    delay: z.number().int().min(0).max(10).optional(),
    lookbackDays: z.number().int().min(20).max(2000).optional(),
    maxStockWeight: z.number().min(0).max(1).optional(),
    decay: z.number().min(0).max(1).optional(),
    neutralization: z.enum(['none', 'industry', 'market']).optional(),
    region: z.string().optional(),
    performanceGoal: z.string().optional(),
  })
  .optional();

const RequestSchema = z.object({
  expression: z.string().min(1),
  config: ConfigSchema,
});

const GenerateExpressionSchema = z.object({
  idea: z.string().min(1, 'Idea cannot be empty'),
});

const server = http.createServer(async (req, res) => {
  const url = parse(req.url || '/', true);

  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  if (req.method === 'POST' && url.pathname === '/simulate_backtest') {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const raw = Buffer.concat(chunks).toString('utf8');
      const parsed = RequestSchema.safeParse(raw ? JSON.parse(raw) : {});
      if (!parsed.success) {
        return sendJson(res, 400, { error: 'invalid_request', details: parsed.error.flatten() });
      }
      const { expression, config } = parsed.data;
      const usedExpr: string = expression.trim();

      // Mock backtest results (same spirit as MCP tool)
      // Influence KPIs with config to make it meaningful and testable
      const baseIr = 1.2 + Math.random() * 0.8;
      const irAdj = (config?.decay ?? 0.5) * 0.2 + (config?.delay ? -config.delay * 0.02 : 0);
      const maxW = config?.maxStockWeight ?? 0.1;
      const turnoverBase = 50 + Math.random() * 100;
      const turnoverAdj = Math.max(10, turnoverBase * (0.5 + 0.5 * (1 - maxW))); // smaller maxW -> lower TO
      const mdBase = -5 - Math.random() * 10;
      const mdAdj = mdBase * (0.7 + 0.6 * maxW);
      const annBase = 8 + Math.random() * 12;
      const annAdj = annBase + (config?.performanceGoal?.includes('return') ? 2 : 0);

      // Generate portfolio PnL data
      const pnlData = Array.from({ length: 252 }, (_, i) => ({
        day: i + 1,
        value: 1000 + i * 2 + Math.sin(i * 0.1) * 50 + Math.random() * 20,
      }));

      // Generate benchmark data (simulating market index like KOSPI or S&P500)
      // Benchmark typically has lower volatility and steady growth
      const benchmarkAnnualReturn = 8 + Math.random() * 4; // 8-12% annual return
      const dailyBenchmarkReturn = benchmarkAnnualReturn / 252 / 100;
      const benchmarkData = Array.from({ length: 252 }, (_, i) => {
        const trend = 1000 * Math.pow(1 + dailyBenchmarkReturn, i);
        const noise = Math.sin(i * 0.08) * 30 + Math.random() * 15;
        return {
          day: i + 1,
          value: Number((trend + noise).toFixed(2)),
        };
      });

      // Calculate benchmark name based on universe
      const benchmarkName =
        config?.universe?.includes('KR') || config?.region === 'KR'
          ? 'KOSPI'
          : config?.universe?.includes('US') || config?.region === 'US'
            ? 'S&P 500'
            : 'Market Index';

      // Calculate alpha (excess return over benchmark)
      const portfolioReturn =
        ((pnlData[pnlData.length - 1].value - pnlData[0].value) / pnlData[0].value) * 100;
      const benchmarkReturn =
        ((benchmarkData[benchmarkData.length - 1].value - benchmarkData[0].value) /
          benchmarkData[0].value) *
        100;
      const alpha = portfolioReturn - benchmarkReturn;

      // Generate mock trade history
      const isKorean = config?.universe?.includes('KR') || config?.region === 'KR';
      const stockPool = isKorean
        ? [
            { symbol: '005930.KS', name: '삼성전자', sector: '정보기술' },
            { symbol: '000660.KS', name: 'SK하이닉스', sector: '정보기술' },
            { symbol: '035420.KS', name: 'NAVER', sector: '커뮤니케이션' },
            { symbol: '005380.KS', name: '현대자동차', sector: '자동차' },
            { symbol: '051910.KS', name: 'LG화학', sector: '소재' },
            { symbol: '006400.KS', name: '삼성SDI', sector: '정보기술' },
            { symbol: '035720.KS', name: '카카오', sector: '커뮤니케이션' },
            { symbol: '003670.KS', name: '포스코퓨처엠', sector: '소재' },
            { symbol: '105560.KS', name: 'KB금융', sector: '금융' },
            { symbol: '055550.KS', name: '신한지주', sector: '금융' },
          ]
        : [
            { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
            { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer' },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology' },
            { symbol: 'META', name: 'Meta Platforms', sector: 'Communication' },
            { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer' },
            { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financial' },
            { symbol: 'V', name: 'Visa Inc.', sector: 'Financial' },
            { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
          ];

      // Generate 20 sample trades
      const trades = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 252);

      for (let i = 0; i < 20; i++) {
        const tradeDate = new Date(startDate);
        tradeDate.setDate(tradeDate.getDate() + Math.floor(Math.random() * 252));
        const stock = stockPool[Math.floor(Math.random() * stockPool.length)];
        const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const quantity = Math.floor(Math.random() * 100 + 10) * 10;
        const price = isKorean
          ? Math.floor(Math.random() * 200000 + 50000)
          : Number((Math.random() * 300 + 50).toFixed(2));
        const amount = quantity * price;
        const pnl =
          action === 'SELL' ? Number((Math.random() * 2000000 - 500000).toFixed(0)) : undefined;
        const pnlPercent = pnl ? Number(((pnl / amount) * 100).toFixed(2)) : undefined;

        trades.push({
          date: tradeDate.toISOString().split('T')[0],
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          action,
          quantity,
          price,
          amount,
          pnl,
          pnlPercent,
        });
      }

      // Sort trades by date
      trades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const mockResults = {
        input: {
          expression: usedExpr,
          config: config ?? null,
        },
        kpis: {
          ir: Number((baseIr + irAdj).toFixed(3)),
          annualReturn: Number(annAdj.toFixed(3)),
          maxDrawdown: Number(mdAdj.toFixed(3)),
          turnover: Number(turnoverAdj.toFixed(3)),
          margin: Number((10 + Math.random() * 20).toFixed(3)),
          correlation: Number((0.1 + Math.random() * 0.3).toFixed(3)),
          alpha: Number(alpha.toFixed(3)),
        },
        pnlData,
        benchmark: {
          name: benchmarkName,
          data: benchmarkData,
          return: Number(benchmarkReturn.toFixed(3)),
        },
        trades,
      };

      return sendJson(res, 200, mockResults);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      return sendJson(res, 500, { error: message });
    }
  }

  if (req.method === 'POST' && url.pathname === '/generate_alpha_expression') {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const raw = Buffer.concat(chunks).toString('utf8');

      let requestData;
      try {
        requestData = raw ? JSON.parse(raw) : {};
      } catch (parseError) {
        return sendJson(res, 400, { error: 'invalid_json', message: 'Invalid JSON format' });
      }

      const parsed = GenerateExpressionSchema.safeParse(requestData);
      if (!parsed.success) {
        return sendJson(res, 400, { error: 'invalid_request', details: parsed.error.flatten() });
      }

      const { idea } = parsed.data;

      // 한글 및 다양한 언어 지원을 위한 유효성 검사
      if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
        return sendJson(res, 400, { error: 'invalid_idea', message: 'Idea cannot be empty' });
      }

      const expression = await generateAlphaExpression(idea);

      // 응답 검증
      if (!expression || typeof expression !== 'string' || expression.trim().length === 0) {
        return sendJson(res, 500, {
          error: 'empty_expression',
          message: 'Generated expression is empty',
        });
      }

      return sendJson(res, 200, { expression });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      console.error('Error in generate_alpha_expression:', err);
      return sendJson(res, 500, { error: 'server_error', message });
    }
  }

  // =============================================
  // Yahoo Finance API Endpoints
  // =============================================

  // GET /api/stock/:symbol - 개별 종목 요약 정보
  if (req.method === 'GET' && url.pathname?.startsWith('/api/stock/')) {
    try {
      const symbol = url.pathname.replace('/api/stock/', '');
      if (!symbol) {
        return sendJson(res, 400, { error: '종목 심볼을 입력해주세요.' });
      }
      const data = await fetchStockSummary(symbol);
      return sendJson(res, 200, data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      return sendJson(res, 500, { error: message });
    }
  }

  // GET /api/historical/:symbol?days=252 - 과거 주가 데이터
  if (req.method === 'GET' && url.pathname?.startsWith('/api/historical/')) {
    try {
      const symbol = url.pathname.replace('/api/historical/', '');
      if (!symbol) {
        return sendJson(res, 400, { error: '종목 심볼을 입력해주세요.' });
      }
      const days = url.query.days ? Number(url.query.days) : 252;
      const withIndicators = url.query.indicators === 'true';

      const data = await fetchHistoricalData(symbol, days);

      if (withIndicators && data.length >= 50) {
        const enrichedData = calculateIndicators(data);
        return sendJson(res, 200, { symbol, days, count: enrichedData.length, data: enrichedData });
      }

      return sendJson(res, 200, { symbol, days, count: data.length, data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      return sendJson(res, 500, { error: message });
    }
  }

  // GET /api/search?q=삼성 - 종목 검색
  if (req.method === 'GET' && url.pathname === '/api/search') {
    try {
      const query = url.query.q as string;
      if (!query) {
        return sendJson(res, 400, { error: '검색어를 입력해주세요.' });
      }
      const results = await searchStocks(query);
      return sendJson(res, 200, { query, count: results.length, results });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      return sendJson(res, 500, { error: message });
    }
  }

  // GET /api/indices - 주요 지수
  if (req.method === 'GET' && url.pathname === '/api/indices') {
    try {
      const data = await fetchMarketIndices();
      return sendJson(res, 200, { count: data.length, data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      return sendJson(res, 500, { error: message });
    }
  }

  // GET /api/korean-stocks - 한국 주요 종목
  if (req.method === 'GET' && url.pathname === '/api/korean-stocks') {
    try {
      const data = await fetchKoreanTopStocks();
      return sendJson(res, 200, { count: data.length, data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      return sendJson(res, 500, { error: message });
    }
  }

  // GET /api/us-tech-stocks - 미국 기술주
  if (req.method === 'GET' && url.pathname === '/api/us-tech-stocks') {
    try {
      const data = await fetchUSTechStocks();
      return sendJson(res, 200, { count: data.length, data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      return sendJson(res, 500, { error: message });
    }
  }

  // POST /api/quotes - 여러 종목 시세 조회
  if (req.method === 'POST' && url.pathname === '/api/quotes') {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const raw = Buffer.concat(chunks).toString('utf8');

      const { symbols } = JSON.parse(raw || '{}');
      if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
        return sendJson(res, 400, { error: '종목 심볼 배열을 입력해주세요.' });
      }

      const data = await fetchMultipleQuotes(symbols);
      return sendJson(res, 200, { requested: symbols.length, received: data.length, data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      return sendJson(res, 500, { error: message });
    }
  }

  // GET /api/health - 서버 상태 확인
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/stock/:symbol - 개별 종목 요약',
        'GET /api/historical/:symbol?days=252&indicators=true - 과거 주가',
        'GET /api/search?q=검색어 - 종목 검색',
        'GET /api/indices - 주요 지수',
        'GET /api/korean-stocks - 한국 주요 종목',
        'GET /api/us-tech-stocks - 미국 기술주',
        'POST /api/quotes - 여러 종목 시세',
        'POST /simulate_backtest - 백테스트 실행',
        'POST /generate_alpha_expression - AI 수식 생성',
      ],
    });
  }

  return sendJson(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.error(`Alpha Architect HTTP bridge listening on http://localhost:${PORT}`);
  console.log('HTTP server started');
  console.log('Available endpoints:');
  console.log('  GET  /api/health - 서버 상태 확인');
  console.log('  GET  /api/stock/:symbol - 개별 종목 요약');
  console.log('  GET  /api/historical/:symbol?days=252&indicators=true - 과거 주가');
  console.log('  GET  /api/search?q=검색어 - 종목 검색');
  console.log('  GET  /api/indices - 주요 지수');
  console.log('  GET  /api/korean-stocks - 한국 주요 종목');
  console.log('  GET  /api/us-tech-stocks - 미국 기술주');
  console.log('  POST /api/quotes - 여러 종목 시세');
  console.log('  POST /simulate_backtest - 백테스트 실행');
  console.log('  POST /generate_alpha_expression - AI 수식 생성');
});
