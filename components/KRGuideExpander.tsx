import React, { useState } from 'react';

interface KRGuideExpanderProps {
  onApplyPreset?: (expression: string) => void;
  onRun?: (expression?: string) => void;
}

export const KRGuideExpander: React.FC<KRGuideExpanderProps> = ({ onApplyPreset, onRun }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="lg:col-span-12 bg-gray-900/60 rounded-lg border border-gray-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 md:px-6 py-3 md:py-4 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-cyan-900/40 text-cyan-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </span>
          <div>
            <h3 className="text-sm md:text-base font-semibold text-gray-100">한글 사용 가이드</h3>
            <p className="text-xs md:text-sm text-gray-400">클릭하여 열고 닫기 • 스튜디오 사용법과 데이터 불러오기 안내</p>
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 pt-0 text-sm leading-6 text-gray-300 space-y-4 border-t border-gray-800">
          <div className="space-y-2">
            <h4 className="text-gray-100 font-semibold">1) 목적</h4>
            <p>
              이 스튜디오는 팩터 아이디어를 수식으로 표현하고 간단한 시뮬레이션을 통해 성과를 빠르게 검증하도록 돕습니다.
              좌측 패널에서 설정을 바꾸고, 수식 에디터에서 알파를 정의한 뒤 결과 영역에서 KPI와 PnL을 확인하세요.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-gray-100 font-semibold">2) 실시간/과거 데이터</h4>
            <p>
              야후 파이낸스 API를 통해 과거 일봉(최대 5년)을 불러올 수 있습니다. 브라우저에서 CORS 제한이 있을 수 있어
              처음 사용할 때 <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" rel="noreferrer" className="text-cyan-300 underline">프록시 활성화</a>
              가 필요할 수 있습니다. MCP 서버를 통해 호출할 경우 CORS 제약 없이 동작합니다.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-gray-100 font-semibold">3) 기본 워크플로우</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li><span className="text-gray-200 font-medium">설정</span>: 유니버스, 제약, 목표 등을 구성합니다.</li>
              <li><span className="text-gray-200 font-medium">알파 정의</span>: 수식을 직접 입력하거나 AI로 생성합니다.</li>
              <li><span className="text-gray-2 00 font-medium">실행</span>: 시뮬레이션을 실행하고 KPI/차트를 확인합니다.</li>
              <li><span className="text-gray-200 font-medium">개선</span>: 성능/안정성을 기준으로 수식을 반복 개선합니다.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-gray-100 font-semibold">4) 참고 팁</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>오버피팅을 피하려면 간결한 수식과 롤링 검증을 권장합니다.</li>
              <li>레짐 변화에 따라 팩터 가중을 조정하면 안정성이 향상됩니다.</li>
              <li>거래 비용과 턴오버 제약을 함께 고려해 실전 적합도를 높이세요.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-gray-100 font-semibold">5) 예시 명령어(초급/중급/고급)</h4>
            <p className="text-gray-400">아래 예시는 에디터의 AI 프롬프트, 또는 MCP 도구 호출(지원 환경)로 활용할 수 있습니다.</p>

            <div className="space-y-2">
              <h5 className="text-gray-200 font-medium">초급(5)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { const e='rank(close / delay(close, 20)) - rank(volume)'; onApplyPreset && onApplyPreset(e); onRun && onRun(e); }}
                  className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-cyan-300 text-left border border-gray-700"
                >모멘텀 기본: rank(close / delay(close, 20)) - rank(volume)</button>
                <button
                  type="button"
                  onClick={() => { const e='rank(returns, 20) - Ts_rank(volume, 5)'; onApplyPreset && onApplyPreset(e); onRun && onRun(e); }}
                  className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-cyan-300 text-left border border-gray-700"
                >단기 과매수 회피: rank(returns, 20) - Ts_rank(volume, 5)</button>
                <button
                  type="button"
                  onClick={() => { const e='z(revenue) + z(ebitda) + z(1/price)'; onApplyPreset && onApplyPreset(e); onRun && onRun(e); }}
                  className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-cyan-300 text-left border border-gray-700"
                >밸류+퀄리티 혼합: z(revenue)+z(ebitda)+z(1/price)</button>
                <button
                  type="button"
                  onClick={() => { const e='rank(close) - rank(volume)'; onApplyPreset && onApplyPreset(e); onRun && onRun(e); }}
                  className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-cyan-300 text-left border border-gray-700"
                >기본 예시: rank(close) - rank(volume)</button>
                <button
                  type="button"
                  onClick={() => { const e='Ts_rank(close/delay(close,1), 10) - Ts_rank(volume, 10)'; onApplyPreset && onApplyPreset(e); onRun && onRun(e); }}
                  className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-cyan-300 text-left border border-gray-700"
                >설명용 예시: Ts_rank(close/delay(close,1),10) - Ts_rank(volume,10)</button>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-gray-200 font-medium">중급(3)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { const e='rank(close / delay(close, 60)) / (1 + stddev(returns, 20))'; onApplyPreset && onApplyPreset(e); onRun && onRun(e); }}
                  className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-cyan-300 text-left border border-gray-700"
                >모멘텀×변동성: rank(close/delay(close,60)) / (1+stddev(returns,20))</button>
                <button
                  type="button"
                  onClick={() => { const e='rank(1/price) + z(revenue) - z(stddev(returns, 60))'; onApplyPreset && onApplyPreset(e); onRun && onRun(e); }}
                  className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-cyan-300 text-left border border-gray-700"
                >밸류-볼 감쇠: rank(1/price)+z(revenue)-z(stddev(returns,60))</button>
                <button
                  type="button"
                  onClick={() => { const e='correlation(returns, volume, 20) - Ts_rank(stddev(returns, 20), 60)'; onApplyPreset && onApplyPreset(e); onRun && onRun(e); }}
                  className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-cyan-300 text-left border border-gray-700"
                >수급·리스크 혼합: corr(returns,volume,20)-Ts_rank(stddev(returns,20),60)</button>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-gray-200 font-medium">고급(2)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { const e='rank(returns, 60) - rank(stddev(returns, 20))'; onApplyPreset && onApplyPreset(e); onRun && onRun(e); }}
                  className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-cyan-300 text-left border border-gray-700"
                >IC 예측용 피처 예시: rank(returns,60) - rank(stddev(returns,20))</button>
                <button
                  type="button"
                  onClick={() => { const e='softmax(rank(returns,20), tau=0.5) / vol'; onApplyPreset && onApplyPreset(e); onRun && onRun(e); }}
                  className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-cyan-300 text-left border border-gray-700"
                >소프트맥스 가중 컨셉: softmax(rank(returns,20), tau=0.5)/vol</button>
              </div>
            </div>

            <div className="rounded-md bg-gray-900/70 border border-gray-800 p-3 text-xs text-gray-400">
              <p className="mb-1">MCP 사용 환경이라면 다음과 같이 직접 도구를 호출할 수도 있습니다:</p>
              <pre className="overflow-auto"><code className="whitespace-pre-wrap">
{`# 가격 데이터 요약(야후 파이낸스)
tool: fetch_historical_data
args: { "ticker": "AAPL" }

# 알파 수식 설명
tool: explain_alpha_expression
args: { "expression": "Ts_rank(close, 10) - Ts_rank(volume, 10)" }`}
              </code></pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KRGuideExpander;


