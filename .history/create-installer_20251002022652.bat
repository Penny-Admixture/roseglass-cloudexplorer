@echo off
echo ========================================
echo RoseGlass CloudExplorer - Installer Builder
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

echo Building installer package...
echo.

REM Create installer directory
if exist "installer-build" rmdir /s /q "installer-build"
mkdir "installer-build"

REM Copy application files
echo [1/4] Copying application files...
xcopy "client\build" "installer-build\client\build\" /E /I
copy "server.js" "installer-build\"
copy "package.json" "installer-build\"
xcopy "services" "installer-build\services\" /E /I

REM Download Rclone
echo [2/4] Downloading Rclone...
mkdir "installer-build\rclone"
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/rclone/rclone/releases/download/v1.65.2/rclone-v1.65.2-windows-amd64.zip' -OutFile 'installer-build\rclone\rclone.zip'"

REM Extract Rclone
echo [3/4] Extracting Rclone...
powershell -Command "Expand-Archive -Path 'installer-build\rclone\rclone.zip' -DestinationPath 'installer-build\rclone\extract' -Force"
copy "installer-build\rclone\extract\rclone-v1.65.2-windows-amd64\rclone.exe" "installer-build\rclone\"
rmdir /s /q "installer-build\rclone\extract"
del "installer-build\rclone\rclone.zip"

REM Create installer script
echo [4/4] Creating installer script...
echo @echo off > "installer-build\install.bat"
echo echo Installing RoseGlass CloudExplorer... >> "installer-build\install.bat"
echo echo. >> "installer-build\install.bat"
echo. >> "installer-build\install.bat"
echo REM Create installation directory >> "installer-build\install.bat"
echo set "INSTALL_DIR=%PROGRAMFILES%\RoseGlass\CloudExplorer" >> "installer-build\install.bat"
echo if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%" >> "installer-build\install.bat"
echo. >> "installer-build\install.bat"
echo REM Copy files >> "installer-build\install.bat"
echo echo Copying application files... >> "installer-build\install.bat"
echo xcopy /E /I /Y "client" "%INSTALL_DIR%\client\" >> "installer-build\install.bat"
echo xcopy /E /I /Y "services" "%INSTALL_DIR%\services\" >> "installer-build\install.bat"
echo xcopy /E /I /Y "rclone" "%INSTALL_DIR%\rclone\" >> "installer-build\install.bat"
echo copy /Y "server.js" "%INSTALL_DIR%\" >> "installer-build\install.bat"
echo copy /Y "package.json" "%INSTALL_DIR%\" >> "installer-build\install.bat"
echo. >> "installer-build\install.bat"
echo REM Create shortcuts >> "installer-build\install.bat"
echo echo Creating shortcuts... >> "installer-build\install.bat"
echo powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\RoseGlass CloudExplorer.lnk'); $Shortcut.TargetPath = 'node'; $Shortcut.Arguments = 'server.js'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Save()" >> "installer-build\install.bat"
echo. >> "installer-build\install.bat"
echo REM Add to PATH >> "installer-build\install.bat"
echo echo Adding to system PATH... >> "installer-build\install.bat"
echo powershell -Command "[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';%INSTALL_DIR%\rclone', 'Machine')" >> "installer-build\install.bat"
echo. >> "installer-build\install.bat"
echo echo Installation completed! >> "installer-build\install.bat"
echo echo You can now run RoseGlass CloudExplorer from the Desktop shortcut. >> "installer-build\install.bat"
echo pause >> "installer-build\install.bat"

REM Create README
echo # RoseGlass CloudExplorer - Installer > "installer-build\README.md"
echo. >> "installer-build\README.md"
echo ## Installation >> "installer-build\README.md"
echo. >> "installer-build\README.md"
echo 1. Run `install.bat` as Administrator >> "installer-build\README.md"
echo 2. Follow the installation prompts >> "installer-build\README.md"
echo 3. Launch from Desktop shortcut >> "installer-build\README.md"
echo 4. Open http://localhost:3000 in your browser >> "installer-build\README.md"
echo 5. Configure Google Drive when prompted >> "installer-build\README.md"
echo. >> "installer-build\README.md"
echo ## Features >> "installer-build\README.md"
echo - Robust Google Drive client built on Rclone >> "installer-build\README.md"
echo - True cut-paste operations >> "installer-build\README.md"
echo - Real-time progress tracking >> "installer-build\README.md"
echo - Dual-pane file browser >> "installer-build\README.md"
echo - Task queue management >> "installer-build\README.md"

REM Create zip file
echo Creating installer package...
powershell -Command "Compress-Archive -Path 'installer-build' -DestinationPath 'RoseGlassCloudExplorer-Installer.zip' -Force"

echo.
echo ========================================
echo Installer build completed!
echo ========================================
echo.
echo Output: RoseGlassCloudExplorer-Installer.zip
echo.
echo To install:
echo 1. Extract the zip file
echo 2. Run install.bat as Administrator
echo 3. Launch from Desktop shortcut
echo.
pause
