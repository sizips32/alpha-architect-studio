import React from 'react';
import type { BacktestResults } from '../types';
import { KpiCard } from './KpiCard';
import { PerformanceChart } from './PerformanceChart';
import { tooltips } from '../constants';

/**
 * Props for the ResultsDashboard component
 */
interface ResultsDashboardProps {
  /** Backtest results to display, or null if no results yet */
  results: BacktestResults | null;
  /** Whether the backtest is currently loading */
  isLoading: boolean;
}

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg text-cyan-400">
    {children}
  </div>
);

const WalkthroughGuide: React.FC = () => (
  <div className="text-center py-12 px-6 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700">
    <h2 className="text-2xl font-bold text-white">Welcome to Alpha Architect</h2>
    <p className="mt-2 text-md text-gray-400">
      Your studio for designing and testing quantitative trading strategies. Follow these steps to
      get started:
    </p>
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
      <div className="flex items-start space-x-4">
        <IconWrapper>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 21v-7m4 7v-4m4 4v-9m4 9V4m4 13V9"></path>
            <path d="M4 14h16"></path>
          </svg>
        </IconWrapper>
        <div>
          <h3 className="text-lg font-semibold text-white">1. Configure Simulation</h3>
          <p className="mt-1 text-sm text-gray-400">
            Use the <strong className="text-cyan-400">Configuration Panel</strong> on the left to
            set up your backtest universe, risk parameters, and strategy goals.
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-4">
        <IconWrapper>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </IconWrapper>
        <div>
          <h3 className="text-lg font-semibold text-white">2. Define Your Alpha</h3>
          <p className="mt-1 text-sm text-gray-400">
            Write your formula in the <strong className="text-cyan-400">Alpha Expression</strong>{' '}
            editor. Or, describe your idea to the{' '}
            <strong className="text-purple-400">AI Assistant</strong> to generate one.
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-4">
        <IconWrapper>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </IconWrapper>
        <div>
          <h3 className="text-lg font-semibold text-white">3. Run Backtest</h3>
          <p className="mt-1 text-sm text-gray-400">
            Click the <strong className="text-cyan-400">&quot;Run Backtest&quot;</strong> button.
            The engine will simulate your strategy against historical data.
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-4">
        <IconWrapper>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18"></path>
            <path d="M7 16V8"></path>
            <path d="M12 16V4"></path>
            <path d="M17 16v-2"></path>
          </svg>
        </IconWrapper>
        <div>
          <h3 className="text-lg font-semibold text-white">4. Analyze Results</h3>
          <p className="mt-1 text-sm text-gray-400">
            Your results, including KPIs and a PnL chart, will appear right here. Good luck, Quant!
          </p>
        </div>
      </div>
    </div>
  </div>
);

const AnalysisAndMindset: React.FC = () => (
  <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
    <div>
      <h3 className="text-lg font-bold text-gray-100 mb-4">How to Interpret Your Results</h3>
      <ul className="space-y-3 text-sm text-gray-400">
        <li className="flex items-start">
          <strong className="text-gray-300 w-36 flex-shrink-0">Information Ratio:</strong> The key
          metric. &gt; 0.5 is promising, &gt; 1.0 is good. It measures your return per unit of risk.
        </li>
        <li className="flex items-start">
          <strong className="text-gray-300 w-36 flex-shrink-0">Turnover &amp; Margin:</strong> Aim
          for low turnover and high margin. High turnover erodes profits via transaction costs.
        </li>
        <li className="flex items-start">
          <strong className="text-gray-300 w-36 flex-shrink-0">Max Drawdown:</strong> Shows the
          biggest loss experienced. A lower value indicates better risk management.
        </li>
        <li className="flex items-start">
          <strong className="text-gray-300 w-36 flex-shrink-0">Correlation:</strong> Look for low
          correlation. This means your alpha is unique and adds diversification value.
        </li>
      </ul>
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-100 mb-4">Attitude for Successful Quants</h3>
      <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
        <li>
          <strong className="text-gray-300">Maintain Curiosity:</strong> Constantly experiment with
          new ideas and explore diverse datasets and regions.
        </li>
        <li>
          <strong className="text-gray-300">Cut Losses:</strong> No strategy is perfect. Have the
          discipline to stop a strategy when it underperforms.
        </li>
        <li>
          <strong className="text-gray-300">Focus on Value:</strong> Automate mundane tasks and
          focus on creative idea generation and rigorous testing.
        </li>
        <li>
          <strong className="text-gray-300">Embrace Simplicity:</strong> Elegant and simple alpha
          expressions are often more robust and less prone to overfitting.
        </li>
      </ul>
    </div>
  </div>
);

/**
 * Results dashboard component that displays backtest results
 * Shows KPIs, performance chart, and analysis guides
 * Displays a welcome guide when no results are available
 *
 * @param results - Backtest results to display
 * @param isLoading - Loading state indicator
 */
export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900/50 rounded-lg border border-gray-800">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="w-12 h-12 text-cyan-500 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg text-gray-300">Running Simulation...</span>
        </div>
      </div>
    );
  }

  if (!results) {
    return <WalkthroughGuide />;
  }

  const { kpis, pnlData } = results;

  // Format KPI values for display
  const kpiValues = {
    ir: kpis.ir.toFixed(2),
    annualReturn: `${(kpis.annualReturn * 100).toFixed(2)}%`,
    maxDrawdown: `${(kpis.maxDrawdown * 100).toFixed(2)}%`,
    turnover: `${(kpis.turnover * 100).toFixed(2)}%`,
    margin: (kpis.margin * 10000).toFixed(2),
    correlation: kpis.correlation.toFixed(2),
    isAnnualReturnPositive: kpis.annualReturn > 0,
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Information Ratio" value={kpiValues.ir} tooltip={tooltips.ir} />
        <KpiCard
          title="Annual Return"
          value={kpiValues.annualReturn}
          tooltip={tooltips.annualReturn}
          isPositive={kpiValues.isAnnualReturnPositive}
        />
        <KpiCard
          title="Max Drawdown"
          value={kpiValues.maxDrawdown}
          tooltip={tooltips.maxDrawdown}
          isPositive={false}
        />
        <KpiCard title="Turnover (Daily)" value={kpiValues.turnover} tooltip={tooltips.turnover} />
        <KpiCard title="Margin (bps)" value={kpiValues.margin} tooltip={tooltips.margin} />
        <KpiCard title="Correlation" value={kpiValues.correlation} tooltip={tooltips.correlation} />
      </div>
      <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 md:p-6">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Portfolio PnL (Profit and Loss)</h3>
        <div className="h-80 w-full">
          <PerformanceChart data={pnlData} />
        </div>
      </div>
      <AnalysisAndMindset />
    </div>
  );
};
