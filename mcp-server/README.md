# Alpha Architect MCP Server

Alpha Architect Studio를 위한 Model Context Protocol (MCP) 서버입니다. Claude Desktop에서 퀀트 전략 개발을 위한 AI 도구들을 사용할 수 있습니다.

## 🚀 주요 기능

### 1. AI 기반 Alpha 표현식 생성

- 자연어로 된 트레이딩 아이디어를 수학적 alpha 표현식으로 변환
- Gemini AI를 활용한 고품질 표현식 생성

### 2. Alpha 표현식 설명

- 복잡한 alpha 표현식을 쉽게 이해할 수 있도록 설명
- 전략의 작동 원리와 시장 조건 분석

### 3. 주식 데이터 조회

- Yahoo Finance API를 통한 실시간 주식 데이터
- 티커 심볼 검색 및 히스토리컬 데이터 조회

### 4. 백테스트 시뮬레이션

- Alpha 표현식의 성과를 시뮬레이션
- KPI 지표 및 PnL 데이터 생성

### 5. 표현식 검증

- Alpha 표현식의 문법 검증
- 사용 가능한 함수 및 필드 가이드

## 📋 사용 가능한 도구들

| 도구명                      | 설명                        | 입력 파라미터                 |
| --------------------------- | --------------------------- | ----------------------------- |
| `generate_alpha_expression` | AI로 alpha 표현식 생성      | `idea` (트레이딩 아이디어)    |
| `explain_alpha_expression`  | Alpha 표현식 설명           | `expression` (alpha 표현식)   |
| `fetch_historical_data`     | 주식 히스토리컬 데이터 조회 | `ticker` (주식 티커)          |
| `search_tickers`            | 티커 심볼 검색              | `query` (검색어)              |
| `validate_alpha_expression` | Alpha 표현식 검증           | `expression` (alpha 표현식)   |
| `get_default_config`        | 기본 설정 조회              | 없음                          |
| `simulate_backtest`         | 백테스트 시뮬레이션         | `expression`, `config` (선택) |

## 🛠️ 설치 방법

### 1. 사전 요구사항

- Node.js 18 이상
- Claude Desktop
- Gemini API 키

### 2. 설치 과정

```bash
# 프로젝트 디렉토리로 이동
cd /Users/soonjaekim/Desktop/SGR/alpha-architect-studio/mcp-server

# 설치 스크립트 실행
./install.sh
```

또는 수동 설치:

```bash
# 의존성 설치
npm install

# 프로젝트 빌드
npm run build

# 환경 변수 설정
cp env.example .env
# .env 파일을 편집하여 GEMINI_API_KEY 추가
```

### 3. Claude Desktop 설정

Claude Desktop의 설정 파일에 다음 내용을 추가하세요:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "alpha-architect-studio": {
      "command": "node",
      "args": ["/Users/soonjaekim/Desktop/SGR/alpha-architect-studio/mcp-server/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "AIzaSyDnHnrUu4llHn0gLX78L3IkvHPe-UsSbTU"
      }
    }
  }
}
```

### 4. Claude Desktop 재시작

설정을 적용하기 위해 Claude Desktop을 재시작하세요.

## 🎯 사용 예시

### Alpha 표현식 생성

```
"모멘텀 전략으로 지난 한 달간 수익률이 높은 주식을 사는 아이디어를 alpha 표현식으로 만들어줘"
```

### Alpha 표현식 설명

```
"Ts_rank(close, 10) - Ts_rank(volume, 10) 이 표현식이 무엇을 하는지 설명해줘"
```

### 주식 데이터 조회

```
"AAPL 주식의 최근 5년간 히스토리컬 데이터를 가져와줘"
```

### 백테스트 시뮬레이션

```
"rank(returns, 20) 표현식으로 백테스트를 실행해줘"
```

## 🔧 개발 및 테스트

### 개발 모드 실행

```bash
npm run dev
```

### 프로덕션 모드 실행

```bash
npm start
```

### 빌드

```bash
npm run build
```

## 📊 Alpha 표현식 문법

### 사용 가능한 데이터 필드

- `open`, `high`, `low`, `close`: OHLC 가격 데이터
- `volume`: 거래량
- `returns`: 일일 수익률
- `cap`: 시가총액
- `revenue`, `ebitda`, `debt`: 펀더멘털 데이터

### 사용 가능한 함수

- `rank(x)`: 횡단면 순위
- `delay(x, d)`: d일 전 값
- `correlation(x, y, d)`: d일간 시계열 상관관계
- `delta(x, d)`: d일간 변화량
- `Ts_rank(x, d)`: d일간 시계열 순위
- `sma(x, d)`: d일간 단순이동평균
- `stddev(x, d)`: d일간 표준편차

### 예시 표현식

```python
# 모멘텀 전략
rank(returns, 20)

# 리버전 전략
-rank(close / delay(close, 5) * volume)

# 이동평균 기반 전략
-rank(close - sma(close, 20))
```

## 🚨 문제 해결

### CORS 오류

Yahoo Finance API 사용 시 CORS 오류가 발생할 수 있습니다. 이 경우 [CORS Anywhere](https://cors-anywhere.herokuapp.com/corsdemo)에서 프록시를 활성화해야 합니다.

### API 키 오류

Gemini API 키가 올바르게 설정되었는지 확인하세요. `.env` 파일에 `GEMINI_API_KEY`가 설정되어 있어야 합니다.

### 빌드 오류

TypeScript 컴파일 오류가 발생하는 경우:

```bash
npm run build
```

명령어로 오류 메시지를 확인하고 수정하세요.

## 📝 라이선스

MIT License

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.
