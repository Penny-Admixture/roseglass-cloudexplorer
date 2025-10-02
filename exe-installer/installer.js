const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('RoseGlass CloudExplorer Installer');
console.log('=====================================');
console.log('');

// Check if running as administrator
function isAdmin() {
  try {
    execSync('net session', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

if (!isAdmin()) {
  console.log('ERROR: This installer requires administrator privileges.');
  console.log('Please right-click on this file and select "Run as administrator".');
  console.log('');
  console.log('Press any key to exit...');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 1));
  return;
}

const installDir = path.join('C:', 'Program Files', 'RoseGlass', 'CloudExplorer');
const desktopDir = path.join(os.homedir(), 'Desktop');
const startMenuDir = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs');

try {
  console.log('Creating installation directory...');
  if (!fs.existsSync(installDir)) {
    fs.mkdirSync(installDir, { recursive: true });
  }

  console.log('Copying application files...');
  const sourceDir = path.join(__dirname, 'RoseGlassCloudExplorer');
  copyDir(sourceDir, installDir);

  console.log('Creating desktop shortcut...');
  createDesktopShortcut();

  console.log('Creating start menu shortcut...');
  createStartMenuShortcut();

  console.log('Adding to system PATH...');
  addToPath(installDir);

  console.log('');
  console.log('Installation completed successfully!');
  console.log('You can now run RoseGlass CloudExplorer from:');
  console.log('- Desktop shortcut');
  console.log('- Start Menu');
  console.log('- Or directly from: ' + installDir);
  console.log('');
  console.log('The application will open in your default web browser at http://localhost:3000');
  console.log('');
  console.log('Press any key to exit...');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
} catch (error) {
  console.error('Installation failed:', error.message);
  console.log('');
  console.log('If you see permission errors, please:');
  console.log('1. Right-click on this installer');
  console.log('2. Select "Run as administrator"');
  console.log('3. Try again');
  console.log('');
  console.log('Press any key to exit...');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 1));
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createDesktopShortcut() {
  const shortcutPath = path.join(desktopDir, 'RoseGlass CloudExplorer.bat');
  const launcherContent = `@echo off
echo RoseGlass CloudExplorer
echo ======================
echo.
echo Starting RoseGlass CloudExplorer...
echo Please wait while the application starts...
echo.
cd /d "${installDir}"
node server.js
pause`;
  fs.writeFileSync(shortcutPath, launcherContent);
}

function createStartMenuShortcut() {
  if (!fs.existsSync(startMenuDir)) {
    fs.mkdirSync(startMenuDir, { recursive: true });
  }
  const shortcutPath = path.join(startMenuDir, 'RoseGlass CloudExplorer.bat');
  const launcherContent = `@echo off
echo RoseGlass CloudExplorer
echo ======================
echo.
echo Starting RoseGlass CloudExplorer...
echo Please wait while the application starts...
echo.
cd /d "${installDir}"
node server.js
pause`;
  fs.writeFileSync(shortcutPath, launcherContent);
}

function addToPath(installDir) {
  try {
    const currentPath = process.env.PATH;
    if (!currentPath.includes(installDir)) {
      const newPath = currentPath + ';' + installDir;
      execSync(`setx PATH "${newPath}" /M`, { stdio: 'ignore' });
    }
  } catch (error) {
    console.log('Note: Could not add to system PATH. You may need to restart your computer.');
  }
}