import React from 'react';

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg text-cyan-400">
    {children}
  </div>
);

const IdeaCard: React.FC<{ title: string; text: string; icon: React.ReactNode }> = ({
  title,
  text,
  icon,
}) => (
  <div className="flex items-start space-x-4">
    <IconWrapper>{icon}</IconWrapper>
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{text}</p>
    </div>
  </div>
);

export const DevelopmentCanvas: React.FC = () => {
  return (
    <div className="p-6 md:p-8 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-white">퀀트의 마인드셋: 알파 개발 가이드</h2>
        <p className="mt-2 text-md text-gray-400">
          이 스튜디오는 알파 아이디어를 생성하고 개선하는 데 도움을 줍니다. 성공에는 좋은 수식뿐만
          아니라 올바른 마인드셋이 필요합니다.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
        <IdeaCard
          title="호기심 유지하기"
          text="새로운 아이디어를 끊임없이 실험하세요. 뉴스, 연구 논문, 시장 이상 현상에서 영감을 얻어 개념을 테스트 가능한 알파로 변환하세요."
          icon={
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
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          }
        />
        <IdeaCard
          title="손절 실행하기"
          text="어떤 규칙도 영원히 완벽하게 작동하지 않음을 인정하세요. 성과가 기대에서 벗어날 때 전략을 포기할 수 있는 규율을 갖추세요. 이것이 장기적 성공의 핵심입니다."
          icon={
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
              <circle cx="6" cy="6" r="3"></circle>
              <circle cx="6" cy="18" r="3"></circle>
              <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
              <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
              <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
            </svg>
          }
        />
        <IdeaCard
          title="고가치 작업에 집중하기"
          text="데이터 정제 및 시뮬레이션 실행과 같은 반복적인 작업을 자동화하세요. 정말 중요한 것에 시간을 할애하세요: 창의적인 아이디어 생성, 엄격한 품질 테스트, 혁신적인 연구."
          icon={
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
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
          }
        />
        <IdeaCard
          title="다양한 분야 탐색하기"
          text="익숙한 분야에 국한되지 마세요. 설정 패널의 3축 계획(TAP)을 사용하여 새로운 데이터셋, 지역, 성과 목표를 탐색하세요. 진정한 혁신은 서로 다른 영역의 교차점에 있습니다."
          icon={
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
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          }
        />
      </div>
    </div>
  );
};

export default DevelopmentCanvas;
