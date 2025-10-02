@echo off
echo Starting RoseGlass CloudExplorer in development mode...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
)

if not exist "client\node_modules" (
    echo Installing frontend dependencies...
    cd client
    npm install
    cd ..
)

REM Start both backend and frontend in development mode
echo Starting development servers...
echo.
echo Backend will be available at: http://localhost:3000
echo Frontend will be available at: http://localhost:3001
echo.
echo Press Ctrl+C to stop both servers
echo.
npm run dev
