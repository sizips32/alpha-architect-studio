# Alpha Architect Studio MCP 서버 설치 가이드

이 가이드는 Alpha Architect Studio MCP 서버를 Claude Desktop에 연동하는 방법을 단계별로 설명합니다.

## 📋 사전 요구사항

- **Node.js 18 이상** 설치 필요
- **Claude Desktop** 설치 필요
- **Gemini API 키** 필요 ([Google AI Studio](https://aistudio.google.com/)에서 발급)

## 🚀 1단계: MCP 서버 설치

### 자동 설치 (권장)

```bash
# 프로젝트 디렉토리로 이동
cd /Users/soonjaekim/Desktop/SGR/alpha-architect-studio/mcp-server

# 설치 스크립트 실행
./install.sh
```

### 수동 설치

```bash
# 의존성 설치
npm install

# 프로젝트 빌드
npm run build

# 환경 변수 파일 생성
cp env.example .env
```

## 🔑 2단계: API 키 설정

### Gemini API 키 발급
1. [Google AI Studio](https://aistudio.google.com/) 접속
2. "Get API Key" 클릭
3. 새 API 키 생성 또는 기존 키 사용

### 환경 변수 설정
`.env` 파일을 편집하여 API 키를 추가하세요:

```bash
# .env 파일 편집
nano .env
```

다음 내용을 추가:
```
GEMINI_API_KEY=your_actual_api_key_here
```

## ⚙️ 3단계: Claude Desktop 설정

### 설정 파일 위치
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

### 설정 파일 생성/편집

Claude Desktop 설정 파일이 없다면 새로 생성하고, 있다면 기존 내용에 추가하세요:

```json
{
  "mcpServers": {
    "alpha-architect-studio": {
      "command": "node",
      "args": ["/Users/soonjaekim/Desktop/SGR/alpha-architect-studio/mcp-server/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your_actual_api_key_here"
      }
    }
  }
}
```

**중요**: `your_actual_api_key_here`를 실제 Gemini API 키로 교체하세요.

### macOS에서 설정 파일 생성 예시

```bash
# 설정 디렉토리 생성
mkdir -p ~/Library/Application\ Support/Claude

# 설정 파일 생성
cat > ~/Library/Application\ Support/Claude/claude_desktop_config.json << 'EOF'
{
  "mcpServers": {
    "alpha-architect-studio": {
      "command": "node",
      "args": ["/Users/soonjaekim/Desktop/SGR/alpha-architect-studio/mcp-server/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your_actual_api_key_here"
      }
    }
  }
}
EOF
```

## 🔄 4단계: Claude Desktop 재시작

설정을 적용하기 위해 Claude Desktop을 완전히 종료하고 다시 시작하세요.

## ✅ 5단계: 설치 확인

Claude Desktop에서 다음과 같이 테스트해보세요:

```
"Alpha Architect Studio 도구들을 사용할 수 있는지 확인해줘"
```

또는

```
"기본 설정을 가져와줘"
```

## 🛠️ 문제 해결

### MCP 서버가 인식되지 않는 경우

1. **경로 확인**: 설정 파일의 경로가 정확한지 확인
2. **빌드 확인**: `mcp-server/dist/index.js` 파일이 존재하는지 확인
3. **권한 확인**: Node.js 실행 권한이 있는지 확인

```bash
# 빌드 상태 확인
ls -la /Users/soonjaekim/Desktop/SGR/alpha-architect-studio/mcp-server/dist/

# Node.js 실행 테스트
node /Users/soonjaekim/Desktop/SGR/alpha-architect-studio/mcp-server/dist/index.js
```

### API 키 오류

```
Error: GEMINI_API_KEY or API_KEY environment variable is required
```

이 오류가 발생하면:
1. `.env` 파일에 올바른 API 키가 설정되어 있는지 확인
2. Claude Desktop 설정 파일의 `env` 섹션에 API 키가 올바르게 설정되어 있는지 확인

### CORS 오류 (주식 데이터 조회 시)

Yahoo Finance API 사용 시 CORS 오류가 발생할 수 있습니다:

1. [CORS Anywhere](https://cors-anywhere.herokuapp.com/corsdemo) 접속
2. "Request temporary access to the demo server" 클릭
3. 잠시 후 다시 시도

## 🧪 테스트 명령어

설치가 완료되면 다음 명령어들로 각 기능을 테스트할 수 있습니다:

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
"AAPL 주식의 최근 데이터를 가져와줘"
```

### 백테스트 시뮬레이션
```
"rank(returns, 20) 표현식으로 백테스트를 실행해줘"
```

## 📞 지원

문제가 지속되면:
1. [MCP 서버 문서](mcp-server/README.md) 확인
2. GitHub Issues에 문제 보고
3. 로그 파일 확인 (Claude Desktop 로그)

## 🎉 완료!

설치가 완료되면 Claude Desktop에서 Alpha Architect Studio의 모든 기능을 사용할 수 있습니다. 퀀트 전략 개발을 시작해보세요!
