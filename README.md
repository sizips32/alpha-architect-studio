<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Alpha Architect Studio

AI 기반 퀀트 전략 개발 스튜디오입니다. 자연어로 된 트레이딩 아이디어를 수학적 alpha 표현식으로 변환하고, 백테스트를 통해 성과를 분석할 수 있습니다.

## 🚀 주요 기능

- **AI 기반 Alpha 표현식 생성**: Gemini AI를 활용한 자연어 → 수학식 변환
- **실시간 주식 데이터**: Yahoo Finance API 연동
- **백테스트 시뮬레이션**: 전략 성과 분석 및 KPI 지표 제공
- **MCP 서버 지원**: Claude Desktop에서 직접 사용 가능

## 📱 웹 앱 실행

**사전 요구사항:** Node.js

1. 의존성 설치:
   ```bash
   # 루트 디렉토리에서
   npm install
   
   # MCP 서버 디렉토리에서
   cd mcp-server
   npm install
   cd ..
   ```

2. Gemini API 키 설정:
   ```bash
   # mcp-server/.env 파일 생성 후 GEMINI_API_KEY 설정
   cd mcp-server
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   cd ..
   ```

3. 백엔드 서버 빌드 및 실행:
   ```bash
   # 백엔드 서버 빌드
   cd mcp-server
   npm run build
   
   # 백엔드 서버 실행 (별도 터미널)
   npm run start:http
   # 또는 개발 모드로 실행 (자동 재시작)
   npm run dev:http
   ```
   
   백엔드 서버는 `http://localhost:8787`에서 실행됩니다.

4. 프론트엔드 개발 서버 실행:
   ```bash
   # 루트 디렉토리에서 (새 터미널)
   npm run dev
   ```

5. 브라우저에서 `http://localhost:3555` 접속

**참고:** 프론트엔드와 백엔드를 함께 실행하려면 두 개의 터미널이 필요합니다:
- 터미널 1: 백엔드 서버 (`cd mcp-server && npm run dev:http`)
- 터미널 2: 프론트엔드 서버 (`npm run dev`)

## 🤖 Claude Desktop 연동 (MCP 서버)

Claude Desktop에서 직접 alpha-architect-studio의 기능을 사용할 수 있습니다.

### 설치 방법

1. MCP 서버 설치:
   ```bash
   cd mcp-server
   ./install.sh
   ```

2. Claude Desktop 설정 파일에 추가:
   ```json
   {
     "mcpServers": {
       "alpha-architect-studio": {
         "command": "node",
         "args": ["/Users/soonjaekim/Desktop/SGR/alpha-architect-studio/mcp-server/dist/index.js"],
         "env": {
           "GEMINI_API_KEY": "your_gemini_api_key_here"
         }
       }
     }
   }
   ```

3. Claude Desktop 재시작

자세한 내용은 [MCP 서버 문서](mcp-server/README.md)를 참조하세요.

## 🎯 사용 예시

### 웹 앱에서
- "모멘텀 전략으로 지난 한 달간 수익률이 높은 주식을 사는 아이디어"를 입력하면 AI가 `rank(returns, 20)` 같은 alpha 표현식을 생성합니다.

### Claude Desktop에서
- "AAPL 주식 데이터를 가져와줘"
- "Ts_rank(close, 10) - Ts_rank(volume, 10) 이 표현식을 설명해줘"
- "rank(returns, 20) 전략으로 백테스트를 실행해줘"

## 📊 Alpha 표현식 문법

### 데이터 필드
- `open`, `high`, `low`, `close`: OHLC 가격
- `volume`: 거래량
- `returns`: 일일 수익률
- `cap`: 시가총액

### 함수
- `rank(x)`: 횡단면 순위
- `delay(x, d)`: d일 전 값
- `Ts_rank(x, d)`: d일간 시계열 순위
- `sma(x, d)`: d일간 단순이동평균

## 🔗 관련 링크

- [AI Studio 앱](https://ai.studio/apps/drive/1hzO6wT07flynDpiZIC7dbsOCPoqIFCdi)
- [MCP 서버 문서](mcp-server/README.md)

## 📝 라이선스

MIT License
