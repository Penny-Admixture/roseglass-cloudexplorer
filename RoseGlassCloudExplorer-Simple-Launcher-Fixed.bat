@echo off
echo RoseGlass CloudExplorer - Simple Launcher
echo =========================================
echo.
echo This will create a working launcher for your desktop app.
echo.
echo Press any key to continue...
pause >nul
echo.

REM Set installation directory
set "INSTALL_DIR=C:\Program Files\RoseGlass\CloudExplorer"

REM Check if app is installed
if not exist "%INSTALL_DIR%\main.js" (
    echo ERROR: RoseGlass CloudExplorer is not installed.
    echo Please run the installer first.
    echo.
    pause
    exit /b 1
)

REM Install Electron if not already installed
echo Installing Electron...
cd /d "%INSTALL_DIR%"
if not exist "node_modules\electron" (
    echo Installing Electron (this may take a moment)...
    call npm install electron --save --silent
)

REM Create a working desktop shortcut
echo Creating working desktop shortcut...
set "DESKTOP=%USERPROFILE%\Desktop"

REM Remove old shortcut if it exists
if exist "%DESKTOP%\RoseGlass CloudExplorer.bat" del "%DESKTOP%\RoseGlass CloudExplorer.bat"

REM Create new working shortcut
echo @echo off > "%DESKTOP%\RoseGlass CloudExplorer.bat"
echo echo Starting RoseGlass CloudExplorer... >> "%DESKTOP%\RoseGlass CloudExplorer.bat"
echo echo Please wait while the application loads... >> "%DESKTOP%\RoseGlass CloudExplorer.bat"
echo cd /d "%INSTALL_DIR%" >> "%DESKTOP%\RoseGlass CloudExplorer.bat"
echo npx electron . >> "%DESKTOP%\RoseGlass CloudExplorer.bat"
echo pause >> "%DESKTOP%\RoseGlass CloudExplorer.bat"

REM Create start menu shortcut
echo Creating start menu shortcut...
set "START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
if not exist "%START_MENU%" mkdir "%START_MENU%"

REM Remove old shortcut if it exists
if exist "%START_MENU%\RoseGlass CloudExplorer.bat" del "%START_MENU%\RoseGlass CloudExplorer.bat"

REM Create new working shortcut
echo @echo off > "%START_MENU%\RoseGlass CloudExplorer.bat"
echo echo Starting RoseGlass CloudExplorer... >> "%START_MENU%\RoseGlass CloudExplorer.bat"
echo echo Please wait while the application loads... >> "%START_MENU%\RoseGlass CloudExplorer.bat"
echo cd /d "%INSTALL_DIR%" >> "%START_MENU%\RoseGlass CloudExplorer.bat"
echo npx electron . >> "%START_MENU%\RoseGlass CloudExplorer.bat"
echo pause >> "%START_MENU%\RoseGlass CloudExplorer.bat"

echo.
echo ✅ Working launcher created successfully!
echo.
echo You now have:
echo - Working desktop shortcut: "RoseGlass CloudExplorer.bat"
echo - Working start menu shortcut
echo - Electron installed and ready to go
echo.
echo Next steps:
echo 1. Double-click the desktop shortcut to start the app
echo 2. Configure Rclone with your Google Drive account
echo 3. Enjoy your robust Google Drive alternative!
echo.
echo Press any key to exit...
pause >nul
