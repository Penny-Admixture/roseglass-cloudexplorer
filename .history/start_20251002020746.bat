@echo off
echo Starting RoseGlass CloudExplorer...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install backend dependencies
        pause
        exit /b 1
    )
)

if not exist "client\node_modules" (
    echo Installing frontend dependencies...
    cd client
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
)

REM Build the React app
echo Building React application...
cd client
npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build React application
    pause
    exit /b 1
)
cd ..

REM Start the server
echo Starting server...
echo.
echo RoseGlass CloudExplorer will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
node server.js
