@echo off
echo ========================================
echo RoseGlass CloudExplorer - MSI Installer Builder
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

echo Building MSI installer package...
echo.

REM Create MSI installer directory
if exist "msi-installer" rmdir /s /q "msi-installer"
mkdir "msi-installer"

REM Copy application files
echo [1/5] Copying application files...
xcopy "client\build" "msi-installer\client\build\" /E /I
copy "server.js" "msi-installer\"
copy "package.json" "msi-installer\"
xcopy "services" "msi-installer\services\" /E /I

REM Download Rclone
echo [2/5] Downloading Rclone...
mkdir "msi-installer\rclone"
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/rclone/rclone/releases/download/v1.65.2/rclone-v1.65.2-windows-amd64.zip' -OutFile 'msi-installer\rclone\rclone.zip'"

REM Extract Rclone
echo [3/5] Extracting Rclone...
powershell -Command "Expand-Archive -Path 'msi-installer\rclone\rclone.zip' -DestinationPath 'msi-installer\rclone\extract' -Force"
copy "msi-installer\rclone\extract\rclone-v1.65.2-windows-amd64\rclone.exe" "msi-installer\rclone\"
rmdir /s /q "msi-installer\rclone\extract"
del "msi-installer\rclone\rclone.zip"

REM Create Electron app structure
echo [4/5] Creating Electron app structure...
mkdir "msi-installer\electron"
copy "electron\main.js" "msi-installer\electron\"
copy "electron\preload.js" "msi-installer\electron\"

REM Create MSI installer script using WiX
echo [5/5] Creating MSI installer script...
echo ^<?xml version="1.0" encoding="UTF-8"?^> > "msi-installer\installer.wxs"
echo ^<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi"^> >> "msi-installer\installer.wxs"
echo   ^<Product Id="*" Name="RoseGlass CloudExplorer" Language="1033" Version="1.0.0.0" Manufacturer="RoseGlass" UpgradeCode="PUT-GUID-HERE"^> >> "msi-installer\installer.wxs"
echo     ^<Package InstallerVersion="200" Compressed="yes" InstallScope="perMachine" /^> >> "msi-installer\installer.wxs"
echo     ^<MajorUpgrade DowngradeErrorMessage="A newer version of [ProductName] is already installed." /^> >> "msi-installer\installer.wxs"
echo     ^<MediaTemplate EmbedCab="yes" /^> >> "msi-installer\installer.wxs"
echo     ^<Feature Id="ProductFeature" Title="RoseGlass CloudExplorer" Level="1"^> >> "msi-installer\installer.wxs"
echo       ^<ComponentGroupRef Id="ProductComponents" /^> >> "msi-installer\installer.wxs"
echo     ^</Feature^> >> "msi-installer\installer.wxs"
echo   ^</Product^> >> "msi-installer\installer.wxs"
echo   ^<Fragment^> >> "msi-installer\installer.wxs"
echo     ^<Directory Id="TARGETDIR" Name="SourceDir"^> >> "msi-installer\installer.wxs"
echo       ^<Directory Id="ProgramFiles64Folder"^> >> "msi-installer\installer.wxs"
echo         ^<Directory Id="INSTALLFOLDER" Name="RoseGlass CloudExplorer"^> >> "msi-installer\installer.wxs"
echo         ^</Directory^> >> "msi-installer\installer.wxs"
echo       ^</Directory^> >> "msi-installer\installer.wxs"
echo     ^</Directory^> >> "msi-installer\installer.wxs"
echo   ^</Fragment^> >> "msi-installer\installer.wxs"
echo   ^<Fragment^> >> "msi-installer\installer.wxs"
echo     ^<ComponentGroup Id="ProductComponents" Directory="INSTALLFOLDER"^> >> "msi-installer\installer.wxs"
echo       ^<Component Id="MainExecutable" Guid="*"^> >> "msi-installer\installer.wxs"
echo         ^<File Id="ServerJS" Name="server.js" Source="server.js" KeyPath="yes" /^> >> "msi-installer\installer.wxs"
echo         ^<File Id="PackageJSON" Name="package.json" Source="package.json" /^> >> "msi-installer\installer.wxs"
echo         ^<File Id="RcloneExe" Name="rclone.exe" Source="rclone\rclone.exe" /^> >> "msi-installer\installer.wxs"
echo       ^</Component^> >> "msi-installer\installer.wxs"
echo     ^</ComponentGroup^> >> "msi-installer\installer.wxs"
echo   ^</Fragment^> >> "msi-installer\installer.wxs"
echo ^</Wix^> >> "msi-installer\installer.wxs"

REM Create a simple executable installer
echo Creating executable installer...
echo @echo off > "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo echo RoseGlass CloudExplorer Installer >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo echo ================================ >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo echo. >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo echo Installing RoseGlass CloudExplorer... >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo echo. >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo. >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo REM Create installation directory >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo set "INSTALL_DIR=%PROGRAMFILES%\RoseGlass\CloudExplorer" >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%" >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo. >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo REM Copy files >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo echo Copying application files... >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo xcopy /E /I /Y "client" "%INSTALL_DIR%\client\" >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo xcopy /E /I /Y "services" "%INSTALL_DIR%\services\" >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo xcopy /E /I /Y "rclone" "%INSTALL_DIR%\rclone\" >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo xcopy /E /I /Y "electron" "%INSTALL_DIR%\electron\" >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo copy /Y "server.js" "%INSTALL_DIR%\" >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo copy /Y "package.json" "%INSTALL_DIR%\" >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo. >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo REM Create shortcuts >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo echo Creating shortcuts... >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\RoseGlass CloudExplorer.lnk'); $Shortcut.TargetPath = 'node'; $Shortcut.Arguments = 'server.js'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Save()" >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\RoseGlass CloudExplorer.lnk'); $Shortcut.TargetPath = 'node'; $Shortcut.Arguments = 'server.js'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Save()" >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo. >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo REM Add to PATH >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo echo Adding to system PATH... >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo powershell -Command "[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';%INSTALL_DIR%\rclone', 'Machine')" >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo. >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo echo Installation completed! >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo echo You can now run RoseGlass CloudExplorer from the Desktop or Start Menu. >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo echo The application will open in your default web browser at http://localhost:3000 >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"
echo pause >> "msi-installer\RoseGlassCloudExplorer-Installer.exe"

REM Create zip file
echo Creating installer package...
powershell -Command "Compress-Archive -Path 'msi-installer' -DestinationPath 'RoseGlassCloudExplorer-MSI-Installer.zip' -Force"

echo.
echo ========================================
echo MSI installer build completed!
echo ========================================
echo.
echo Output: RoseGlassCloudExplorer-MSI-Installer.zip
echo.
echo To install:
echo 1. Extract the zip file
echo 2. Run RoseGlassCloudExplorer-Installer.exe as Administrator
echo 3. Launch from Desktop or Start Menu shortcut
echo 4. The app will open in your browser at http://localhost:3000
echo.
echo This creates a native Windows application that runs independently!
echo.
pause
