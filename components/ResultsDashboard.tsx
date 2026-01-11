import React, { useMemo, useCallback } from 'react';
import type { BacktestResults, Config } from '../types';
import { KpiCard } from './KpiCard';
import { PerformanceChart } from './PerformanceChart';
import { tooltips } from '../constants';
import { exportToPdf } from '../utils/pdfExport';
import { exportToExcel } from '../utils/excelExport';

/**
 * Props for the ResultsDashboard component
 */
interface ResultsDashboardProps {
  /** Backtest results to display, or null if no results yet */
  results: BacktestResults | null;
  /** Whether the backtest is currently loading */
  isLoading: boolean;
  /** The alpha expression used for the backtest */
  expression?: string;
  /** The configuration used for the backtest */
  config?: Config;
}

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg text-cyan-400">
    {children}
  </div>
);

const WalkthroughGuide: React.FC = () => (
  <div className="text-center py-12 px-6 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700">
    <h2 className="text-2xl font-bold text-white">알파 아키텍트에 오신 것을 환영합니다</h2>
    <p className="mt-2 text-md text-gray-400">
      퀀트 트레이딩 전략을 설계하고 테스트하는 스튜디오입니다. 아래 단계를 따라 시작하세요:
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
          <h3 className="text-lg font-semibold text-white">1. 시뮬레이션 설정</h3>
          <p className="mt-1 text-sm text-gray-400">
            왼쪽 <strong className="text-cyan-400">설정 패널</strong>에서 백테스트 유니버스, 리스크
            파라미터, 전략 목표를 설정하세요.
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
          <h3 className="text-lg font-semibold text-white">2. 알파 정의</h3>
          <p className="mt-1 text-sm text-gray-400">
            <strong className="text-cyan-400">알파 수식</strong> 에디터에 수식을 직접 작성하거나,{' '}
            <strong className="text-purple-400">AI 어시스턴트</strong>에게 아이디어를 설명하여
            생성하세요.
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
          <h3 className="text-lg font-semibold text-white">3. 백테스트 실행</h3>
          <p className="mt-1 text-sm text-gray-400">
            <strong className="text-cyan-400">"백테스트 실행"</strong> 버튼을 클릭하세요. 엔진이
            과거 데이터를 기반으로 전략을 시뮬레이션합니다.
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
          <h3 className="text-lg font-semibold text-white">4. 결과 분석</h3>
          <p className="mt-1 text-sm text-gray-400">
            KPI와 PnL 차트를 포함한 결과가 여기에 표시됩니다. 행운을 빕니다, 퀀트!
          </p>
        </div>
      </div>
    </div>
  </div>
);

const AnalysisAndMindset: React.FC = () => (
  <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
    <div>
      <h3 className="text-lg font-bold text-gray-100 mb-4">결과 해석 방법</h3>
      <ul className="space-y-3 text-sm text-gray-400">
        <li className="flex items-start">
          <strong className="text-gray-300 w-36 flex-shrink-0">정보비율:</strong> 핵심 지표입니다.
          0.5 이상이면 유망, 1.0 이상이면 양호합니다. 위험 대비 수익률을 측정합니다.
        </li>
        <li className="flex items-start">
          <strong className="text-gray-300 w-36 flex-shrink-0">턴오버 &amp; 마진:</strong> 낮은
          턴오버와 높은 마진을 목표로 하세요. 높은 턴오버는 거래 비용으로 수익을 감소시킵니다.
        </li>
        <li className="flex items-start">
          <strong className="text-gray-300 w-36 flex-shrink-0">최대 낙폭:</strong> 경험한 최대
          손실을 나타냅니다. 낮을수록 리스크 관리가 우수합니다.
        </li>
        <li className="flex items-start">
          <strong className="text-gray-300 w-36 flex-shrink-0">상관관계:</strong> 낮은 상관관계를
          찾으세요. 알파가 독특하고 분산 투자 가치가 있음을 의미합니다.
        </li>
      </ul>
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-100 mb-4">성공적인 퀀트의 자세</h3>
      <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
        <li>
          <strong className="text-gray-300">호기심 유지:</strong> 새로운 아이디어를 끊임없이
          실험하고 다양한 데이터셋과 지역을 탐색하세요.
        </li>
        <li>
          <strong className="text-gray-300">손절 실행:</strong> 완벽한 전략은 없습니다. 성과가
          저조할 때 전략을 중단할 수 있는 규율을 갖추세요.
        </li>
        <li>
          <strong className="text-gray-300">가치에 집중:</strong> 반복적인 작업을 자동화하고
          창의적인 아이디어 생성과 엄격한 테스트에 집중하세요.
        </li>
        <li>
          <strong className="text-gray-300">단순함 추구:</strong> 우아하고 간단한 알파 수식이 더
          견고하고 과적합에 덜 취약합니다.
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
export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  results,
  isLoading,
  expression,
  config,
}) => {
  const handleExportPdf = useCallback(() => {
    if (results && expression && config) {
      exportToPdf({ results, expression, config });
    }
  }, [results, expression, config]);

  const handleExportExcel = useCallback(() => {
    if (results && expression && config) {
      exportToExcel({ results, expression, config });
    }
  }, [results, expression, config]);

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
          <span className="text-lg text-gray-300">시뮬레이션 실행 중...</span>
        </div>
      </div>
    );
  }

  if (!results) {
    return <WalkthroughGuide />;
  }

  const { kpis, pnlData, benchmark } = results;

  // Memoize KPI values to prevent unnecessary recalculations
  const kpiValues = useMemo(
    () => ({
      ir: kpis.ir.toFixed(2),
      annualReturn: `${(kpis.annualReturn * 100).toFixed(2)}%`,
      maxDrawdown: `${(kpis.maxDrawdown * 100).toFixed(2)}%`,
      turnover: `${(kpis.turnover * 100).toFixed(2)}%`,
      margin: (kpis.margin * 10000).toFixed(2),
      correlation: kpis.correlation.toFixed(2),
      isAnnualReturnPositive: kpis.annualReturn > 0,
    }),
    [kpis]
  );

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header with Export Buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">백테스트 결과</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={!expression || !config}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M8 13h2" />
              <path d="M8 17h2" />
              <path d="M14 13h2" />
              <path d="M14 17h2" />
            </svg>
            Excel
          </button>
          <button
            onClick={handleExportPdf}
            disabled={!expression || !config}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="정보비율" value={kpiValues.ir} tooltip={tooltips.ir} />
        <KpiCard
          title="연간 수익률"
          value={kpiValues.annualReturn}
          tooltip={tooltips.annualReturn}
          isPositive={kpiValues.isAnnualReturnPositive}
        />
        <KpiCard
          title="최대 낙폭"
          value={kpiValues.maxDrawdown}
          tooltip={tooltips.maxDrawdown}
          isPositive={false}
        />
        <KpiCard title="턴오버 (일간)" value={kpiValues.turnover} tooltip={tooltips.turnover} />
        <KpiCard title="마진 (bps)" value={kpiValues.margin} tooltip={tooltips.margin} />
        <KpiCard title="상관관계" value={kpiValues.correlation} tooltip={tooltips.correlation} />
      </div>
      <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 md:p-6">
        <h3 className="text-lg font-bold text-gray-100 mb-4">포트폴리오 손익 (PnL)</h3>
        <div className="w-full">
          <PerformanceChart data={pnlData} benchmark={benchmark} />
        </div>
      </div>
      <AnalysisAndMindset />
    </div>
  );
};

export default ResultsDashboard;
