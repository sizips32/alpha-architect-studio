import { AppError, ErrorCodes, handleServiceError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

/**
 * Generates an alpha expression from a trading idea using the backend API.
 * This ensures API keys are never exposed to the frontend.
 * @param idea - The trading idea or strategy concept in natural language
 * @returns Promise resolving to a mathematical alpha expression
 * @throws {AppError} If the API call fails
 */
const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export const generateAlphaExpression = async (idea: string): Promise<string> => {
  if (!idea.trim()) {
    throw new AppError('AI prompt cannot be empty.', ErrorCodes.EMPTY_INPUT, 400);
  }

  try {
    logger.debug('Generating alpha expression', { ideaLength: idea.length });
    const response = await fetch(`${DEFAULT_API_URL}/generate_alpha_expression`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
      },
      body: JSON.stringify({ idea }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new AppError(
        errorData.error || `Failed to generate expression (${response.status})`,
        ErrorCodes.API_REQUEST_FAILED,
        response.status
      );
    }

    // 응답 본문을 텍스트로 먼저 가져와서 디버깅 가능하도록
    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      logger.error(
        'Failed to parse server response',
        parseError instanceof Error ? parseError : undefined,
        {
          responseText: responseText.substring(0, 200),
          status: response.status,
        }
      );
      throw new AppError('Invalid JSON response from server', ErrorCodes.API_REQUEST_FAILED, 500);
    }

    // 응답 구조 검증
    if (!data || typeof data !== 'object') {
      logger.error('Invalid response structure', undefined, { response: data });
      throw new AppError(
        'Invalid response structure from server',
        ErrorCodes.API_REQUEST_FAILED,
        500
      );
    }

    if (
      !data.expression ||
      typeof data.expression !== 'string' ||
      data.expression.trim().length === 0
    ) {
      logger.error('Invalid or empty expression in response', undefined, { response: data });
      throw new AppError(
        'Invalid or empty expression in server response',
        ErrorCodes.API_REQUEST_FAILED,
        500
      );
    }

    logger.info('Alpha expression generated successfully', {
      expressionLength: data.expression.length,
    });
    return data.expression;
  } catch (error) {
    logger.error(
      'Failed to generate alpha expression',
      error instanceof Error ? error : undefined,
      { ideaLength: idea.length }
    );
    throw handleServiceError(error);
  }
};
