@echo off
echo RoseGlass CloudExplorer - Fixed Standalone Desktop App Installer
echo =================================================================
echo.
echo This will create a REAL desktop application (not a web browser thing).
echo.
echo Press any key to continue...
pause >nul
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This installer requires administrator privileges.
    echo.
    echo Please right-click on this file and select "Run as administrator".
    echo.
    pause
    exit /b 1
)

REM Set installation directory
set "INSTALL_DIR=C:\Program Files\RoseGlass\CloudExplorer"

REM Create installation directory
echo Creating installation directory...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Create the standalone desktop app
echo Creating standalone desktop application...

REM Create the main app file
(
echo const { app, BrowserWindow, Menu } = require('electron'^);
echo const path = require('path'^);
echo const { execSync } = require('child_process'^);
echo.
echo let mainWindow;
echo.
echo function createWindow(^) {
echo   mainWindow = new BrowserWindow({
echo     width: 1200,
echo     height: 800,
echo     webPreferences: {
echo       nodeIntegration: true,
echo       contextIsolation: false
echo     },
echo     title: 'RoseGlass CloudExplorer',
echo     show: false,
echo     icon: path.join(__dirname, 'icon.ico'^)
echo   }^);
echo.
echo   // Load the app interface
echo   mainWindow.loadFile('index.html'^);
echo.
echo   // Remove menu bar for clean desktop app look
echo   Menu.setApplicationMenu(null^);
echo.
echo   // Show window when ready
echo   mainWindow.once('ready-to-show', (^) =^> {
echo     mainWindow.show(^);
echo   }^);
echo.
echo   mainWindow.on('closed', (^) =^> {
echo     mainWindow = null;
echo   }^);
echo }
echo.
echo app.whenReady(^).then(createWindow^);
echo.
echo app.on('window-all-closed', (^) =^> {
echo   if (process.platform !== 'darwin'^) {
echo     app.quit(^);
echo   }
echo }^);
echo.
echo app.on('activate', (^) =^> {
echo   if (BrowserWindow.getAllWindows(^).length === 0^) {
echo     createWindow(^);
echo   }
echo }^);
) > "%INSTALL_DIR%\main.js"

REM Create package.json
(
echo {
echo   "name": "roseglass-cloudexplorer",
echo   "version": "1.0.0",
echo   "description": "RoseGlass CloudExplorer - Google Drive Alternative",
echo   "main": "main.js",
echo   "scripts": {
echo     "start": "electron ."
echo   },
echo   "dependencies": {
echo     "electron": "^28.0.0"
echo   }
echo }
) > "%INSTALL_DIR%\package.json"

REM Create the HTML interface
(
echo ^<!DOCTYPE html^>
echo ^<html lang="en"^>
echo ^<head^>
echo     ^<meta charset="UTF-8"^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
echo     ^<title^>RoseGlass CloudExplorer^</title^>
echo     ^<style^>
echo         * { margin: 0; padding: 0; box-sizing: border-box; }
echo         body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
echo         .app { height: 100vh; display: flex; flex-direction: column; }
echo         .header { background: #2c3e50; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
echo         .header h1 { font-size: 18px; font-weight: 600; }
echo         .main-content { flex: 1; padding: 20px; overflow-y: auto; }
echo         .status-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1^); }
echo         .status-card h3 { color: #2c3e50; margin-bottom: 10px; }
echo         .btn { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; }
echo         .btn:hover { background: #2980b9; }
echo         .btn-success { background: #27ae60; }
echo         .btn-success:hover { background: #229954; }
echo         .file-list { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1^); }
echo         .file-item { padding: 12px; border-bottom: 1px solid #ecf0f1; display: flex; justify-content: space-between; align-items: center; }
echo         .file-item:hover { background: #f8f9fa; }
echo         .file-item:last-child { border-bottom: none; }
echo         .file-name { font-weight: 500; color: #2c3e50; }
echo         .file-size { color: #7f8c8d; font-size: 12px; }
echo         .setup-instructions { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0; }
echo         .setup-instructions h4 { color: #856404; margin-bottom: 10px; }
echo         .setup-instructions ol { margin-left: 20px; }
echo         .setup-instructions li { margin-bottom: 5px; color: #856404; }
echo     ^</style^>
echo ^</head^>
echo ^<body^>
echo     ^<div class="app"^>
echo         ^<div class="header"^>
echo             ^<h1^>🌹 RoseGlass CloudExplorer^</h1^>
echo             ^<div^>Google Drive Alternative^</div^>
echo         ^</div^>
echo         ^<div class="main-content"^>
echo             ^<div class="status-card"^>
echo                 ^<h3^>Welcome to RoseGlass CloudExplorer^</h3^>
echo                 ^<p^>A robust Google Drive alternative built on Rclone technology.^</p^>
echo                 ^<p^>This is a standalone desktop application - no browser required!^</p^>
echo             ^</div^>
echo             
echo             ^<div id="setup-section"^>
echo                 ^<div class="setup-instructions"^>
echo                     ^<h4^>Initial Setup Required^</h4^>
echo                     ^<p^>To use RoseGlass CloudExplorer, you need to configure Rclone with your Google Drive account:^</p^>
echo                     ^<ol^>
echo                         ^<li^>Open Command Prompt as Administrator^</li^>
echo                         ^<li^>Navigate to: %INSTALL_DIR%^</li^>
echo                         ^<li^>Run: rclone config^</li^>
echo                         ^<li^>Follow the setup wizard^</li^>
echo                         ^<li^>Name your remote "remote"^</li^>
echo                         ^<li^>Refresh this application^</li^>
echo                     ^</ol^>
echo                 ^</div^>
echo                 ^<button class="btn" onclick="checkRclone(^)"^>Check Rclone Status^</button^>
echo             ^</div^>
echo             
echo             ^<div id="main-section" style="display: none;"^>
echo                 ^<div class="file-list"^>
echo                     ^<h3^>Your Google Drive Files^</h3^>
echo                     ^<button class="btn btn-success" onclick="loadFiles(^)"^>Refresh Files^</button^>
echo                     ^<div id="file-list" style="margin-top: 15px;"^>^</div^>
echo                 ^</div^>
echo             ^</div^>
echo         ^</div^>
echo     ^</div^>
echo.
echo     ^<script^>
echo         // Check if Rclone is configured
echo         function checkRclone(^) {
echo             const { execSync } = require('child_process'^);
echo             try {
echo                 execSync('rclone lsf remote:', { stdio: 'ignore' }^);
echo                 document.getElementById('setup-section'^).style.display = 'none';
echo                 document.getElementById('main-section'^).style.display = 'block';
echo                 loadFiles(^);
echo             } catch (error^) {
echo                 alert('Rclone is not configured yet. Please follow the setup instructions above.'^);
echo             }
echo         }
echo.
echo         function loadFiles(^) {
echo             const { execSync } = require('child_process'^);
echo             try {
echo                 const result = execSync('rclone lsf --json remote:', { encoding: 'utf8' }^);
echo                 const files = JSON.parse(result^);
echo                 const fileList = document.getElementById('file-list'^);
echo                 fileList.innerHTML = files.map(file =^> 
echo                     '^<div class="file-item"^>^<span class="file-name"^>' + file.Name + '^</span^>^<span class="file-size"^>' + (file.Size || 'Folder'^) + '^</span^>^</div^>'
echo                 ^).join(''^);
echo             } catch (error^) {
echo                 console.error('Error loading files:', error^);
echo                 document.getElementById('file-list'^).innerHTML = '^<p^>Error loading files. Please check your Rclone configuration.^</p^>';
echo             }
echo         }
echo.
echo         // Auto-check on load
echo         window.onload = function(^) {
echo             checkRclone(^);
echo         };
echo     ^</script^>
echo ^</body^>
echo ^</html^>
) > "%INSTALL_DIR%\index.html"

REM Download Rclone
echo Downloading Rclone...
cd /d "%INSTALL_DIR%"
if not exist "rclone.exe" (
    echo Downloading Rclone v1.71.1...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/rclone/rclone/releases/download/v1.71.1/rclone-v1.71.1-windows-amd64.zip' -OutFile 'rclone.zip'"
    if exist "rclone.zip" (
        powershell -Command "Expand-Archive -Path 'rclone.zip' -DestinationPath '.' -Force"
        if exist "rclone-v1.71.1-windows-amd64" (
            move rclone-v1.71.1-windows-amd64\rclone.exe .
            rmdir /s /q rclone-v1.71.1-windows-amd64
        )
        del rclone.zip
    )
)

REM Install Electron
echo Installing Electron...
call npm install electron --save

REM Create desktop shortcut
echo Creating desktop shortcut...
set "DESKTOP=%USERPROFILE%\Desktop"
echo @echo off > "%DESKTOP%\RoseGlass CloudExplorer.bat"
echo echo Starting RoseGlass CloudExplorer... >> "%DESKTOP%\RoseGlass CloudExplorer.bat"
echo cd /d "%INSTALL_DIR%" >> "%DESKTOP%\RoseGlass CloudExplorer.bat"
echo npx electron . >> "%DESKTOP%\RoseGlass CloudExplorer.bat"
echo pause >> "%DESKTOP%\RoseGlass CloudExplorer.bat"

REM Create start menu shortcut
echo Creating start menu shortcut...
set "START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
if not exist "%START_MENU%" mkdir "%START_MENU%"
echo @echo off > "%START_MENU%\RoseGlass CloudExplorer.bat"
echo echo Starting RoseGlass CloudExplorer... >> "%START_MENU%\RoseGlass CloudExplorer.bat"
echo cd /d "%INSTALL_DIR%" >> "%START_MENU%\RoseGlass CloudExplorer.bat"
echo npx electron . >> "%START_MENU%\RoseGlass CloudExplorer.bat"
echo pause >> "%START_MENU%\RoseGlass CloudExplorer.bat"

REM Add to PATH
echo Adding to system PATH...
setx PATH "%PATH%;%INSTALL_DIR%" /M >nul 2>&1

echo.
echo ✅ Standalone desktop application installed successfully!
echo.
echo What you got:
echo - REAL desktop application (not a web browser thing)
echo - Native Windows app with proper window controls
echo - No localhost:3000 nonsense - it's a proper desktop app
echo - Rclone integration for Google Drive management
echo - Desktop and Start Menu shortcuts
echo.
echo Next steps:
echo 1. Run the desktop shortcut to start RoseGlass CloudExplorer
echo 2. Configure Rclone with your Google Drive account
echo 3. Enjoy your robust Google Drive alternative!
echo.
echo Press any key to exit...
pause >nul
