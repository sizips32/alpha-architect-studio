import type { Config } from './types';

/**
 * Default configuration for alpha strategy development
 * Used as initial state when the app loads
 */
export const defaultConfig: Config = {
  universe: 'TOP_3000',
  delay: 1,
  lookbackDays: 60,
  maxStockWeight: 2,
  decay: 5,
  neutralization: 'Market',
  idea: 'Momentum',
  region: 'US',
  performanceGoal: 'High_IR',
};

/**
 * Tooltip definitions for configuration parameters and KPIs
 * Maps parameter names to their explanatory tooltip text
 */
export const tooltips: { [key: string]: string } = {
  universe: '알파가 거래할 종목 집합입니다. 예: 유동성 상위 3000개 종목',
  delay: '데이터 가용성 지연입니다. Delay-1은 전일 가격을 사용하여 당일 거래를 결정합니다.',
  lookbackDays: '알파 신호 계산에 사용되는 과거 데이터 기간(일)입니다.',
  maxStockWeight: '개별 종목 리스크를 제한하기 위한 최대 종목별 비중입니다.',
  decay: '알파 값에 선형 감쇠를 적용하는 기간(일)입니다. 신호를 부드럽게 하고 턴오버를 줄입니다.',
  neutralization:
    '시스템 리스크 제거 방법입니다. 시장 중립은 시장 베타를, 산업 중립은 산업별 리스크를 제거합니다.',
  ir: '정보비율(IR). 위험 조정 수익률을 측정합니다. 높을수록 좋으며, IR > 1은 양호한 수준입니다.',
  annualReturn: '주어진 기간 동안 투자로 매년 벌어들인 평균 수익률입니다.',
  maxDrawdown: '새로운 고점이 달성되기 전, 포트폴리오의 고점에서 저점까지 관측된 최대 손실입니다.',
  turnover: '일별 포트폴리오 매매 비율입니다. 높은 턴오버는 거래 비용 증가로 이어질 수 있습니다.',
  margin:
    '거래의 수익 마진으로, 베이시스 포인트(1bp = 0.01%)로 측정됩니다. 높을수록 수익성이 좋습니다.',
  correlation:
    '알파와 벤치마크(예: 시장) 간의 통계적 관계를 측정합니다. 분산 투자를 위해 낮은 상관관계가 바람직합니다.',
};
