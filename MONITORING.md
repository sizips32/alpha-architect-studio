# 모니터링 및 로깅 가이드

## 현재 구현 상태

### 로깅 시스템

- 구조화된 로깅 유틸리티 (`utils/logger.ts`) 구현 완료
- 개발 환경: 모든 로그 레벨 표시 (DEBUG, INFO, WARN, ERROR)
- 프로덕션 환경: WARN 및 ERROR만 표시

### 로그 레벨

- **DEBUG**: 개발 중 디버깅 정보
- **INFO**: 일반적인 정보성 메시지
- **WARN**: 경고 메시지
- **ERROR**: 에러 메시지

## 향후 개선 사항

### 1. 에러 추적 서비스 통합

프로덕션 환경에서 에러를 추적하기 위해 다음 서비스 중 하나를 통합할 수 있습니다:

#### Sentry (권장)

```typescript
// utils/logger.ts에 추가
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
  });
}

// error 메서드에서
if (level === LogLevel.ERROR && import.meta.env.PROD) {
  Sentry.captureException(error, { extra: context });
}
```

#### 설치

```bash
npm install --save @sentry/react
```

### 2. 성능 모니터링

애플리케이션 성능을 모니터링하기 위해 다음을 고려할 수 있습니다:

- **Web Vitals**: Core Web Vitals 측정
- **Custom Metrics**: API 응답 시간, 백테스트 실행 시간 등

### 3. 사용자 분석

사용자 행동을 분석하기 위해 다음을 고려할 수 있습니다:

- **Google Analytics**: 기본 사용 통계
- **Mixpanel / Amplitude**: 고급 이벤트 추적

### 4. 실시간 모니터링 대시보드

프로덕션 환경에서 실시간으로 모니터링할 수 있는 대시보드를 구축할 수 있습니다:

- **Grafana + Prometheus**: 메트릭 수집 및 시각화
- **Datadog / New Relic**: 통합 모니터링 플랫폼

## 로깅 사용 예시

```typescript
import { logger } from './utils/logger';

// 디버그 로그
logger.debug('User action', { action: 'click', button: 'generate' });

// 정보 로그
logger.info('Backtest started', { expression: 'rank(returns, 20)' });

// 경고 로그
logger.warn('Slow API response', { responseTime: 5000 });

// 에러 로그
try {
  // some operation
} catch (error) {
  logger.error('Operation failed', error as Error, { context: 'additional info' });
}
```

## 환경 변수 설정

프로덕션 배포 시 다음 환경 변수를 설정하세요:

```bash
# Sentry DSN (선택사항)
VITE_SENTRY_DSN=your_sentry_dsn_here

# 로그 레벨 (선택사항, 기본값: PROD=WARN, DEV=DEBUG)
VITE_LOG_LEVEL=INFO
```
