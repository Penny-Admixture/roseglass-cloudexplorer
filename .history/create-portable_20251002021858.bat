@echo off
echo ========================================
echo RoseGlass CloudExplorer - Portable Build
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

echo Building portable version...
echo.

REM Create portable directory
if exist "portable" rmdir /s /q "portable"
mkdir "portable"

REM Copy server files
echo [1/4] Copying server files...
copy "server.js" "portable\"
copy "package.json" "portable\"
xcopy "services" "portable\services\" /E /I
xcopy "client\build" "portable\client\build\" /E /I

REM Download Rclone
echo [2/4] Downloading Rclone...
mkdir "portable\rclone"
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/rclone/rclone/releases/download/v1.65.2/rclone-v1.65.2-windows-amd64.zip' -OutFile 'portable\rclone\rclone.zip'"

REM Extract Rclone
echo [3/4] Extracting Rclone...
powershell -Command "Expand-Archive -Path 'portable\rclone\rclone.zip' -DestinationPath 'portable\rclone\extract' -Force"
copy "portable\rclone\extract\rclone-v1.65.2-windows-amd64\rclone.exe" "portable\rclone\"
rmdir /s /q "portable\rclone\extract"
del "portable\rclone\rclone.zip"

REM Create startup script
echo [4/4] Creating startup script...
echo @echo off > "portable\start.bat"
echo echo Starting RoseGlass CloudExplorer... >> "portable\start.bat"
echo echo. >> "portable\start.bat"
echo echo Open http://localhost:3000 in your browser >> "portable\start.bat"
echo echo Press Ctrl+C to stop the server >> "portable\start.bat"
echo echo. >> "portable\start.bat"
echo node server.js >> "portable\start.bat"

REM Create README
echo # RoseGlass CloudExplorer - Portable Version > "portable\README.md"
echo. >> "portable\README.md"
echo ## Quick Start >> "portable\README.md"
echo. >> "portable\README.md"
echo 1. Double-click `start.bat` >> "portable\README.md"
echo 2. Open http://localhost:3000 in your browser >> "portable\README.md"
echo 3. Configure Google Drive when prompted >> "portable\README.md"
echo. >> "portable\README.md"
echo ## Features >> "portable\README.md"
echo - Robust Google Drive client built on Rclone >> "portable\README.md"
echo - True cut-paste operations >> "portable\README.md"
echo - Real-time progress tracking >> "portable\README.md"
echo - Dual-pane file browser >> "portable\README.md"
echo - Task queue management >> "portable\README.md"

echo.
echo ========================================
echo Portable build completed!
echo ========================================
echo.
echo Output: portable\ folder
echo.
echo To run:
echo 1. Navigate to the portable folder
echo 2. Double-click start.bat
echo 3. Open http://localhost:3000 in your browser
echo.
echo The portable version includes Rclone and everything needed to run.
echo.
pause
