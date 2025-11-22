/**
 * Re-export shared types for backward compatibility.
 * All type definitions are now maintained in the shared directory.
 */

export type {
    Config,
    HistoricalData,
    PnlDataPoint,
    Kpis,
    BacktestResults,
    AlphaExpression,
} from '../../shared/types.js';

export {
    ConfigSchema,
    HistoricalDataSchema,
    PnlDataPointSchema,
    KpisSchema,
    BacktestResultsSchema,
    AlphaExpressionSchema,
} from '../../shared/types.js';
