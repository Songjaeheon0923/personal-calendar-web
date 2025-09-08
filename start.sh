#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Personal Calendar - Starting Full Stack Application...${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed or not in PATH${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js detected: $(node --version)${NC}"
echo ""

# Check if concurrently is installed in root
if [ ! -d "node_modules/concurrently" ]; then
    echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
    npm install
    echo ""
fi

# Check backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm run install:backend
    echo ""
fi

# Check frontend dependencies  
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm run install:frontend
    echo ""
fi

# Check if database exists
if [ ! -f "backend/data/calendar.db" ]; then
    echo -e "${YELLOW}🗄️  Initializing database...${NC}"
    npm run db:init
    echo ""
fi

echo -e "${BLUE}🚀 Starting both servers...${NC}"
echo ""
echo -e "${GREEN}📡 Backend API will run on: http://localhost:3001${NC}"
echo -e "${GREEN}🌐 Frontend will run on: http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Start both servers
npm run dev