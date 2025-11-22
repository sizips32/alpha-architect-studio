#!/usr/bin/env node

import http from 'http';
import { parse } from 'url';
import { z } from 'zod';
import { generateAlphaExpression, validateApiKey } from './services/geminiService.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

function sendJson(res: http.ServerResponse, status: number, data: unknown) {
    const body = JSON.stringify(data);
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(body);
}

function handleOptions(res: http.ServerResponse) {
    res.writeHead(204, {
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
}

// Reuse the MCP simulate_backtest input shape
const ConfigSchema = z.object({
    universe: z.string().optional(),
    delay: z.number().int().min(0).max(10).optional(),
    lookbackDays: z.number().int().min(20).max(2000).optional(),
    maxStockWeight: z.number().min(0).max(1).optional(),
    decay: z.number().min(0).max(1).optional(),
    neutralization: z.enum(['none', 'industry', 'market']).optional(),
    region: z.string().optional(),
    performanceGoal: z.string().optional(),
}).optional();

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
            const mdAdj = mdBase * (0.7 + 0.6 * (maxW));
            const annBase = 8 + Math.random() * 12;
            const annAdj = annBase + (config?.performanceGoal?.includes('return') ? 2 : 0);

            const mockResults = {
                input: {
                    expression: usedExpr,
                    config: config ?? null,
                },
                kpis: {
                    ir: Number((baseIr + irAdj).toFixed(3)),
                    annualReturn: Number((annAdj).toFixed(3)),
                    maxDrawdown: Number((mdAdj).toFixed(3)),
                    turnover: Number((turnoverAdj).toFixed(3)),
                    margin: Number((10 + Math.random() * 20).toFixed(3)),
                    correlation: Number((0.1 + Math.random() * 0.3).toFixed(3)),
                },
                pnlData: Array.from({ length: 252 }, (_, i) => ({
                    day: i + 1,
                    value: 1000 + (i * 2) + Math.sin(i * 0.1) * 50 + Math.random() * 20,
                })),
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
            const parsed = GenerateExpressionSchema.safeParse(raw ? JSON.parse(raw) : {});
            if (!parsed.success) {
                return sendJson(res, 400, { error: 'invalid_request', details: parsed.error.flatten() });
            }
            const { idea } = parsed.data;
            const expression = await generateAlphaExpression(idea);
            return sendJson(res, 200, { expression });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Internal Server Error';
            return sendJson(res, 500, { error: message });
        }
    }

    return sendJson(res, 404, { error: 'Not Found' });
});

// Validate environment variables before starting server
try {
    validateApiKey();
    console.error('Environment validation passed');
} catch (error) {
    console.error('FATAL: Environment validation failed');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
}

server.listen(PORT, () => {
    console.error(`Alpha Architect HTTP bridge listening on http://localhost:${PORT}`);
    console.error(`CORS allowed origins: ${ALLOWED_ORIGINS}`);
});


