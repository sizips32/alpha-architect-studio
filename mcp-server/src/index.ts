#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { generateAlphaExpression, explainAlphaExpression } from './services/geminiService.js';
import {
  fetchHistoricalData,
  searchTickers,
  CorsActivationError,
} from './services/yahooFinanceService.js';
import { ConfigSchema, type BacktestResults } from './types.js';

// Define the tools available through MCP
const tools: Tool[] = [
  {
    name: 'generate_alpha_expression',
    description: 'Generate a quantitative alpha expression from a trading idea using AI',
    inputSchema: {
      type: 'object',
      properties: {
        idea: {
          type: 'string',
          description: 'The trading idea or strategy concept to convert into an alpha expression',
        },
      },
      required: ['idea'],
    },
  },
  {
    name: 'explain_alpha_expression',
    description: 'Explain what an alpha expression does in simple terms',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'The alpha expression to explain',
        },
      },
      required: ['expression'],
    },
  },
  {
    name: 'fetch_historical_data',
    description: 'Fetch historical stock price data for a given ticker symbol',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Stock ticker symbol (e.g., AAPL, MSFT, GOOGL)',
        },
      },
      required: ['ticker'],
    },
  },
  {
    name: 'search_tickers',
    description: 'Search for stock ticker symbols by name or symbol',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for ticker symbol or company name',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'validate_alpha_expression',
    description: 'Validate the syntax of an alpha expression',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'The alpha expression to validate',
        },
      },
      required: ['expression'],
    },
  },
  {
    name: 'get_default_config',
    description: 'Get the default configuration for alpha strategy development',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'simulate_backtest',
    description: 'Simulate a backtest with given parameters (mock implementation)',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'The alpha expression to backtest',
        },
        config: {
          type: 'object',
          description: 'Configuration parameters for the backtest',
          properties: {
            universe: { type: 'string' },
            delay: { type: 'number' },
            lookbackDays: { type: 'number' },
            maxStockWeight: { type: 'number' },
            decay: { type: 'number' },
            neutralization: { type: 'string' },
            region: { type: 'string' },
            performanceGoal: { type: 'string' },
          },
        },
      },
      required: ['expression'],
    },
  },
];

// Create the MCP server
const server = new Server(
  {
    name: 'alpha-architect-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_alpha_expression': {
        const { idea } = z.object({ idea: z.string() }).parse(args);
        const expression = await generateAlphaExpression(idea);
        return {
          content: [
            {
              type: 'text',
              text: `Generated alpha expression: ${expression}`,
            },
          ],
        };
      }

      case 'explain_alpha_expression': {
        const { expression } = z.object({ expression: z.string() }).parse(args);
        const explanation = await explainAlphaExpression(expression);
        return {
          content: [
            {
              type: 'text',
              text: explanation,
            },
          ],
        };
      }

      case 'fetch_historical_data': {
        const { ticker } = z.object({ ticker: z.string() }).parse(args);
        try {
          const data = await fetchHistoricalData(ticker);
          const summary = {
            ticker,
            dataPoints: data.length,
            dateRange: {
              start: data[0]?.date.toISOString().split('T')[0],
              end: data[data.length - 1]?.date.toISOString().split('T')[0],
            },
            latestPrice: data[data.length - 1]?.close,
            sampleData: data.slice(-5).map((d) => ({
              date: d.date.toISOString().split('T')[0],
              close: d.close,
              volume: d.volume,
            })),
          };

          return {
            content: [
              {
                type: 'text',
                text: `Historical data for ${ticker}:\n\n${JSON.stringify(summary, null, 2)}`,
              },
            ],
          };
        } catch (error) {
          if (error instanceof CorsActivationError) {
            return {
              content: [
                {
                  type: 'text',
                  text: `CORS proxy activation required. Please visit: ${error.activationUrl}`,
                },
              ],
            };
          }
          throw error;
        }
      }

      case 'search_tickers': {
        const { query } = z.object({ query: z.string() }).parse(args);
        const results = await searchTickers(query);
        return {
          content: [
            {
              type: 'text',
              text: `Search results for "${query}":\n\n${results.map((r) => `${r.symbol} - ${r.name} (${r.exchange})`).join('\n')}`,
            },
          ],
        };
      }

      case 'validate_alpha_expression': {
        const { expression } = z.object({ expression: z.string() }).parse(args);

        // Basic validation - check for common alpha expression patterns
        const validFunctions = [
          'rank',
          'delay',
          'correlation',
          'delta',
          'Ts_rank',
          'sma',
          'stddev',
        ];
        const validFields = [
          'open',
          'high',
          'low',
          'close',
          'volume',
          'returns',
          'cap',
          'revenue',
          'ebitda',
          'debt',
        ];

        const hasValidFunction = validFunctions.some((func) => expression.includes(func));
        const hasValidField = validFields.some((field) => expression.includes(field));

        const isValid = hasValidFunction && hasValidField && expression.trim().length > 0;

        return {
          content: [
            {
              type: 'text',
              text: `Validation result for "${expression}":\n\n${isValid ? '✅ Valid' : '❌ Invalid'}\n\nValid functions: ${validFunctions.join(', ')}\nValid fields: ${validFields.join(', ')}`,
            },
          ],
        };
      }

      case 'get_default_config': {
        const defaultConfig = ConfigSchema.parse({});
        return {
          content: [
            {
              type: 'text',
              text: `Default configuration:\n\n${JSON.stringify(defaultConfig, null, 2)}`,
            },
          ],
        };
      }

      case 'simulate_backtest': {
        const { expression } = z
          .object({
            expression: z.string(),
            config: z
              .object({
                universe: z.string().optional(),
                delay: z.number().optional(),
                lookbackDays: z.number().optional(),
                maxStockWeight: z.number().optional(),
                decay: z.number().optional(),
                neutralization: z.string().optional(),
                region: z.string().optional(),
                performanceGoal: z.string().optional(),
              })
              .optional(),
          })
          .parse(args);

        // Mock backtest results
        const mockResults: BacktestResults = {
          kpis: {
            ir: 1.2 + Math.random() * 0.8, // 1.2-2.0
            annualReturn: 8 + Math.random() * 12, // 8-20%
            maxDrawdown: -5 - Math.random() * 10, // -5% to -15%
            turnover: 50 + Math.random() * 100, // 50-150%
            margin: 10 + Math.random() * 20, // 10-30 bps
            correlation: 0.1 + Math.random() * 0.3, // 0.1-0.4
          },
          pnlData: Array.from({ length: 252 }, (_, i) => ({
            day: i + 1,
            value: 1000 + i * 2 + Math.sin(i * 0.1) * 50 + Math.random() * 20,
          })),
        };

        return {
          content: [
            {
              type: 'text',
              text: `Backtest simulation results for "${expression}":\n\n${JSON.stringify(mockResults, null, 2)}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Alpha Architect MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
