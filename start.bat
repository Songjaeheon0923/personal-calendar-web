@echo off
cd /d "%~dp0"

echo Starting Personal Calendar...
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js not found
    pause
    exit
)

if not exist node_modules (
    npm install
)

if not exist backend\node_modules (
    cd backend && npm install && cd ..
)

if not exist frontend\node_modules (
    cd frontend && npm install && cd ..
)

echo Starting servers...
timeout /t 2 >nul

npm run dev