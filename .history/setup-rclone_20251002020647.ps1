# RoseGlass CloudExplorer - Rclone Setup Script
# This script automatically downloads, installs, and configures Rclone for Windows

Write-Host "RoseGlass CloudExplorer - Rclone Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "This script needs to run as Administrator to modify system PATH." -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Create tools directory
$toolsDir = "C:\Tools\rclone"
Write-Host "Creating tools directory: $toolsDir" -ForegroundColor Green

if (-not (Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
    Write-Host "✓ Created directory: $toolsDir" -ForegroundColor Green
} else {
    Write-Host "✓ Directory already exists: $toolsDir" -ForegroundColor Green
}

# Get latest Rclone version
Write-Host ""
Write-Host "Fetching latest Rclone version..." -ForegroundColor Yellow

try {
    $latestRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/rclone/rclone/releases/latest"
    $version = $latestRelease.tag_name -replace 'v', ''
    $downloadUrl = $latestRelease.assets | Where-Object { $_.name -like "*windows-amd64.zip" } | Select-Object -First 1 -ExpandProperty browser_download_url
    
    Write-Host "✓ Latest version: $version" -ForegroundColor Green
    Write-Host "✓ Download URL: $downloadUrl" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to fetch latest version: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Using fallback version..." -ForegroundColor Yellow
    
    $version = "1.65.2"
    $downloadUrl = "https://github.com/rclone/rclone/releases/download/v$version/rclone-v$version-windows-amd64.zip"
}

# Download Rclone
$zipFile = "$env:TEMP\rclone-windows-amd64.zip"
Write-Host ""
Write-Host "Downloading Rclone v$version..." -ForegroundColor Yellow

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
    Write-Host "✓ Download completed" -ForegroundColor Green
} catch {
    Write-Host "✗ Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Extract Rclone
Write-Host ""
Write-Host "Extracting Rclone..." -ForegroundColor Yellow

try {
    $extractDir = "$env:TEMP\rclone-extract"
    if (Test-Path $extractDir) {
        Remove-Item $extractDir -Recurse -Force
    }
    
    Expand-Archive -Path $zipFile -DestinationPath $extractDir -Force
    
    # Find the extracted rclone.exe
    $rcloneExe = Get-ChildItem -Path $extractDir -Name "rclone.exe" -Recurse | Select-Object -First 1
    if (-not $rcloneExe) {
        throw "rclone.exe not found in extracted files"
    }
    
    $sourcePath = Join-Path $extractDir $rcloneExe
    $destPath = "$toolsDir\rclone.exe"
    
    Copy-Item -Path $sourcePath -Destination $destPath -Force
    
    # Clean up
    Remove-Item $extractDir -Recurse -Force
    Remove-Item $zipFile -Force
    
    Write-Host "✓ Rclone extracted to: $destPath" -ForegroundColor Green
} catch {
    Write-Host "✗ Extraction failed: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Add to PATH
Write-Host ""
Write-Host "Adding Rclone to system PATH..." -ForegroundColor Yellow

try {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($currentPath -notlike "*$toolsDir*") {
        $newPath = $currentPath + ";" + $toolsDir
        [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
        Write-Host "✓ Added to system PATH" -ForegroundColor Green
    } else {
        Write-Host "✓ Already in system PATH" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Failed to add to PATH: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "You may need to manually add $toolsDir to your PATH" -ForegroundColor Yellow
}

# Test installation
Write-Host ""
Write-Host "Testing Rclone installation..." -ForegroundColor Yellow

try {
    $rcloneVersion = & "$toolsDir\rclone.exe" version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Rclone is working correctly" -ForegroundColor Green
        Write-Host "Version: $($rcloneVersion[0])" -ForegroundColor Green
    } else {
        throw "Rclone version command failed"
    }
} catch {
    Write-Host "✗ Rclone test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check the installation manually" -ForegroundColor Yellow
}

# Create config directory
$configDir = "$env:APPDATA\rclone"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    Write-Host "✓ Created config directory: $configDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup completed!" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your command prompt/PowerShell to pick up the new PATH" -ForegroundColor White
Write-Host "2. Run 'rclone config' to set up your Google Drive remote" -ForegroundColor White
Write-Host "3. Start the RoseGlass CloudExplorer application" -ForegroundColor White
Write-Host ""
Write-Host "Rclone location: $toolsDir\rclone.exe" -ForegroundColor Green
Write-Host "Config location: $configDir\rclone.conf" -ForegroundColor Green
Write-Host ""

# Ask if user wants to configure Google Drive now
$configureNow = Read-Host "Would you like to configure Google Drive now? (y/n)"
if ($configureNow -eq 'y' -or $configureNow -eq 'Y') {
    Write-Host ""
    Write-Host "Starting Rclone configuration..." -ForegroundColor Yellow
    Write-Host "Follow the prompts to set up Google Drive access." -ForegroundColor White
    Write-Host ""
    
    try {
        & "$toolsDir\rclone.exe" config
        Write-Host ""
        Write-Host "✓ Google Drive configuration completed!" -ForegroundColor Green
    } catch {
        Write-Host "✗ Configuration failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "You can run 'rclone config' manually later" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Setup script completed. You can now use RoseGlass CloudExplorer!" -ForegroundColor Cyan
Read-Host "Press Enter to exit"
