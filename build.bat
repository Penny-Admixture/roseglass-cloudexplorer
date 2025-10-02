@echo off
echo ========================================
echo RoseGlass CloudExplorer - MSI Builder
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Building complete MSI installer with integrated Rclone...
echo This will create a professional Windows installer.
echo.

REM Install dependencies
echo [1/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

REM Install client dependencies
echo [2/5] Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

REM Build React app
echo [3/5] Building React application...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build React application
    pause
    exit /b 1
)
cd ..

REM Download Rclone
echo [4/5] Downloading Rclone...
node -e "const installer = require('./services/RcloneInstaller'); const inst = new installer(); inst.install().then(() => console.log('Rclone downloaded')).catch(console.error);"
if %errorlevel% neq 0 (
    echo Warning: Failed to download Rclone automatically
    echo You may need to download it manually
)

REM Build Electron app and installer
echo [5/5] Building Electron application and MSI installer...
call npm run dist-win-msi
if %errorlevel% neq 0 (
    echo Error: Failed to build installer
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Output files:
echo - dist\RoseGlassCloudExplorer-Setup.msi
echo - dist\RoseGlassCloudExplorer-Setup.exe
echo.
echo You can now distribute the MSI file to users.
echo The installer will handle everything automatically!
echo.
pause
