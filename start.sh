#!/bin/bash

# Alpha Architect Studio - Startup Script
# 퀀트 전략 개발 스튜디오 시작 스크립트

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Parse arguments first (before any setup)
MODE="all"
while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-only)
            MODE="backend"
            shift
            ;;
        --frontend-only)
            MODE="frontend"
            shift
            ;;
        --build-only)
            MODE="build"
            shift
            ;;
        --help|-h)
            echo ""
            echo -e "${BLUE}Alpha Architect Studio - Startup Script${NC}"
            echo ""
            echo "Usage: ./start.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --backend-only   Start only the backend server"
            echo "  --frontend-only  Start only the frontend server"
            echo "  --build-only     Only install dependencies and build (no server start)"
            echo "  --help, -h       Show this help message"
            echo ""
            echo "Ports:"
            echo "  Frontend: http://localhost:3555"
            echo "  Backend:  http://localhost:8787"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}[ERROR]${NC} Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Print colored message
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Header
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Alpha Architect Studio - Startup Script          ║${NC}"
echo -e "${BLUE}║       알파 아키텍트 스튜디오 시작 스크립트             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check Node.js
print_status "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js v18 or higher is required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) detected"

# Check npm
print_status "Checking npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi
print_success "npm $(npm -v) detected"

# Check/Create environment file for MCP server
print_status "Checking environment configuration..."
if [ ! -f "mcp-server/.env" ]; then
    print_warning "mcp-server/.env not found"

    # Check if GEMINI_API_KEY is set in environment
    if [ -n "$GEMINI_API_KEY" ]; then
        echo "GEMINI_API_KEY=$GEMINI_API_KEY" > mcp-server/.env
        print_success "Created mcp-server/.env from environment variable"
    else
        print_warning "GEMINI_API_KEY not set. Creating template .env file..."
        echo "GEMINI_API_KEY=your_api_key_here" > mcp-server/.env
        print_warning "Please edit mcp-server/.env and add your Gemini API key"
        echo ""
        read -p "Press Enter after setting the API key, or Ctrl+C to cancel..."
    fi
else
    print_success "mcp-server/.env exists"
fi

# Install root dependencies
print_status "Installing root dependencies..."
npm install --legacy-peer-deps
print_success "Root dependencies installed"

# Install MCP server dependencies
print_status "Installing MCP server dependencies..."
cd mcp-server
npm install --legacy-peer-deps
print_success "MCP server dependencies installed"

# Build MCP server
print_status "Building MCP server..."
npm run build
print_success "MCP server built successfully"

cd "$SCRIPT_DIR"

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down servers..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    print_success "Servers stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

if [ "$MODE" = "build" ]; then
    print_success "Build completed successfully!"
    exit 0
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                   Starting Servers                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Start backend server
if [ "$MODE" = "all" ] || [ "$MODE" = "backend" ]; then
    print_status "Starting backend server on port 8787..."
    cd mcp-server
    npm run start:http &
    BACKEND_PID=$!
    cd "$SCRIPT_DIR"

    # Wait for backend to be ready
    print_status "Waiting for backend to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:8787/api/health > /dev/null 2>&1; then
            print_success "Backend server is ready at http://localhost:8787"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend server failed to start within 30 seconds"
            cleanup
            exit 1
        fi
        sleep 1
    done
fi

# Start frontend server
if [ "$MODE" = "all" ] || [ "$MODE" = "frontend" ]; then
    print_status "Starting frontend server on port 3555..."
    npm run dev &
    FRONTEND_PID=$!

    # Wait for frontend to be ready
    sleep 3
    print_success "Frontend server is ready at http://localhost:3555"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              All servers are running!                  ║${NC}"
echo -e "${GREEN}║              모든 서버가 실행 중입니다!                ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Frontend: ${BLUE}http://localhost:3555${GREEN}                      ║${NC}"
echo -e "${GREEN}║  Backend:  ${BLUE}http://localhost:8787${GREEN}                      ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Press ${RED}Ctrl+C${GREEN} to stop all servers                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Wait for processes
wait
