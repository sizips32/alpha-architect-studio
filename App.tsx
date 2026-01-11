import React, { Suspense, lazy, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { Config } from './types';
import { generateAlphaExpression } from './services/geminiService';
import { defaultConfig } from './constants';
import { KRGuideExpander } from './components/KRGuideExpander';
import type { BacktestResults } from './types';
import { simulateBacktest } from './services/backtestService';
import { AppError, getUserFriendlyMessage } from './utils/errorHandler';

// Lazy load heavy components for code splitting
const ConfigPanel = lazy(() => import('./components/ConfigPanel'));
const ExpressionEditor = lazy(() => import('./components/ExpressionEditor'));
const ResultsDashboard = lazy(() => import('./components/ResultsDashboard'));
const DevelopmentCanvas = lazy(() => import('./components/DevelopmentCanvas'));

// Loading fallback component
const LoadingFallback: React.FC<{ height?: string }> = ({ height = '200px' }) => (
  <div className="animate-pulse bg-gray-800 rounded-lg" style={{ height }} />
);

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
      setError(new Error('AI 프롬프트를 입력해주세요.'));
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
          setError(new Error('수식을 입력해주세요.'));
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
        <strong className="font-bold">오류: </strong>
        <span className="block sm:inline whitespace-pre-wrap">{error.message}</span>
        <button
          onClick={() => setError(null)}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          aria-label="닫기"
        >
          <svg
            className="fill-current h-6 w-6 text-red-400 hover:text-red-200"
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>닫기</title>
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
          <Suspense fallback={<LoadingFallback height="400px" />}>
            <ConfigPanel config={config} setConfig={setConfig} />
          </Suspense>
        </div>
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 lg:gap-8">
          <Suspense fallback={<LoadingFallback height="300px" />}>
            <ExpressionEditor
              expression={alphaExpression}
              setExpression={setAlphaExpression}
              onGenerate={handleGenerateExpression}
              isAiLoading={isAiLoading}
            />
          </Suspense>
          {renderError()}
          <button
            onClick={() => runSimulation()}
            className="self-start inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition"
          >
            백테스트 실행
          </button>
          <Suspense fallback={<LoadingFallback height="400px" />}>
            <ResultsDashboard results={results} isLoading={isSimLoading} />
          </Suspense>
          <Suspense fallback={<LoadingFallback />}>
            <DevelopmentCanvas />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
