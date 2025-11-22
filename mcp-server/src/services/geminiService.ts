import { GoogleGenAI } from "@google/genai";
import type { AlphaExpression } from '../types.js';

/**
 * Validates that required API key is set
 * Should be called during server initialization
 */
export function validateApiKey(): void {
    if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
        throw new Error("GEMINI_API_KEY or API_KEY environment variable is required");
    }
}

// Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const generateAlphaExpression = async (idea: string): Promise<AlphaExpression> => {

    const prompt = `
    You are an expert quantitative analyst. Your task is to convert a user's trading idea into a mathematical alpha expression.
    The expression should use a specific syntax with the available functions and data fields.

    Available Data Fields:
    - open, high, low, close: Standard OHLC prices.
    - volume: Daily trading volume.
    - returns: Daily returns.
    - cap: Market capitalization.
    - revenue, ebitda, debt: Fundamental data.

    Available Functions:
    - rank(x): Cross-sectional rank of x.
    - delay(x, d): Value of x, d days ago.
    - correlation(x, y, d): Time-series correlation of x and y over d days.
    - delta(x, d): Today's value of x minus the value d days ago.
    - Ts_rank(x, d): Time-series rank of x over the past d days.
    - sma(x, d): Simple moving average of x over d days.
    - stddev(x, d): Standard deviation of x over d days.

    Example Ideas and Expressions:
    - "A momentum strategy that buys stocks with high returns over the last month."
      Expression: "rank(returns, 20)"
    
    - "A reversion strategy that sells stocks that have gone up quickly compared to their volume."
      Expression: "-rank(close / delay(close, 5) * volume)"
    
    - "A mean reversion strategy based on price relative to moving average."
      Expression: "-rank(close - sma(close, 20))"
    
    Now, convert the following idea into a single, elegant alpha expression. Provide ONLY the expression itself, with no explanation or surrounding text.

    User Idea: "${idea}"
  `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        // Clean up the response, removing potential markdown or extra text
        const text = response.text?.trim() || '';
        if (text.startsWith('`') && text.endsWith('`')) {
            return text.substring(1, text.length - 1);
        }
        return text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to communicate with the generative model.");
    }
};

export const explainAlphaExpression = async (expression: string): Promise<string> => {
    const prompt = `
    You are an expert quantitative analyst. Explain the following alpha expression in simple terms:
    
    Expression: "${expression}"
    
    Please provide:
    1. What this strategy does in plain English
    2. The key components and how they work together
    3. What market conditions this strategy might perform well in
    4. Potential risks or limitations
    
    Keep the explanation clear and accessible to both quantitative and non-quantitative audiences.
  `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text?.trim() || '';
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to explain the alpha expression.");
    }
};
