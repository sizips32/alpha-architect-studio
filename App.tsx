import React, { useState, useCallback } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { ExpressionEditor } from './components/ExpressionEditor';
import { DevelopmentCanvas } from './components/DevelopmentCanvas';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { Config } from './types';
import { generateAlphaExpression } from './services/geminiService';
import { defaultConfig } from './constants';
import { KRGuideExpander } from './components/KRGuideExpander';
import { ResultsDashboard } from './components/ResultsDashboard';
import type { BacktestResults } from './types';
import { simulateBacktest } from './services/backtestService';
import { getUserFriendlyMessage } from './utils/errorHandler';

const App: React.FC = () => {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [alphaExpression, setAlphaExpression] = useState<string>(
    'Ts_rank(close, 10) - Ts_rank(volume, 10)'
  );
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<BacktestResults | null>(null);
  const [isSimLoading, setIsSimLoading] = useState<boolean>(false);

  const handleGenerateExpression = useCallback(async (idea: string) => {
    if (!idea.trim()) {
      setError(new Error('AI prompt cannot be empty.'));
      return;
    }
    setError(null);
    setIsAiLoading(true);
    try {
      const expression = await generateAlphaExpression(idea);
      setAlphaExpression(expression);
    } catch (err) {
      const friendlyMessage = getUserFriendlyMessage(err);
      setError(new Error(friendlyMessage));
      console.error('Error generating expression:', err);
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  const runSimulation = useCallback(
    async (expr?: string) => {
      setIsSimLoading(true);
      setError(null);
      try {
        const usedExpr = (expr ?? alphaExpression).trim();
        if (!usedExpr) {
          setError(new Error('Expression cannot be empty.'));
          return;
        }
        const out = await simulateBacktest(usedExpr, config);
        setResults(out);
      } catch (err) {
        const friendlyMessage = getUserFriendlyMessage(err);
        setError(new Error(friendlyMessage));
        console.error('Error running simulation:', err);
      } finally {
        setIsSimLoading(false);
      }
    },
    [alphaExpression, config]
  );

  const renderError = () => {
    if (!error) return null;

    return (
      <div
        className="relative p-4 pl-5 pr-12 bg-red-900/50 text-red-300 border border-red-700 rounded-lg"
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline whitespace-pre-wrap">{error.message}</span>
        <button
          onClick={() => setError(null)}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          aria-label="Close"
        >
          <svg
            className="fill-current h-6 w-6 text-red-400 hover:text-red-200"
            role="button"
            xmlns="http://www.w.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <KRGuideExpander
          onApplyPreset={(expr) => setAlphaExpression(expr)}
          onRun={(expr) => runSimulation(expr)}
        />
        <div className="lg:col-span-4 xl:col-span-3 bg-gray-900/50 rounded-lg border border-gray-800">
          <ConfigPanel config={config} setConfig={setConfig} />
        </div>
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 lg:gap-8">
          <ExpressionEditor
            expression={alphaExpression}
            setExpression={setAlphaExpression}
            onGenerate={handleGenerateExpression}
            isAiLoading={isAiLoading}
          />
          {renderError()}
          <button
            onClick={() => runSimulation()}
            className="self-start inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition"
          >
            Run Backtest
          </button>
          <ResultsDashboard results={results} isLoading={isSimLoading} />
          <DevelopmentCanvas />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
