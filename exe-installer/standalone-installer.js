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

  console.log('Downloading and setting up application...');
  
  // Create a simple server.js file
  const serverContent = `const express = require('express');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = 3000;

// Serve static files from client directory
app.use(express.static(path.join(__dirname, 'client')));

// API endpoints
app.get('/api/files', (req, res) => {
  try {
    const { execSync } = require('child_process');
    const result = execSync('rclone lsf --json ' + (req.query.remote || 'remote:'), { encoding: 'utf8' });
    res.json(JSON.parse(result));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(\`RoseGlass CloudExplorer running at http://localhost:\${PORT}\`);
  console.log('Press Ctrl+C to stop the server');
});

// Auto-open browser
const { exec } = require('child_process');
exec('start http://localhost:3000');
`;

  fs.writeFileSync(path.join(installDir, 'server.js'), serverContent);

  // Create package.json
  const packageContent = `{
  "name": "roseglass-cloudexplorer",
  "version": "1.0.0",
  "description": "RoseGlass CloudExplorer - Google Drive Alternative",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`;

  fs.writeFileSync(path.join(installDir, 'package.json'), packageContent);

  // Create basic HTML client
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RoseGlass CloudExplorer</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .status { padding: 20px; background: #e8f5e8; border-radius: 4px; margin: 20px 0; }
        .error { background: #ffe8e8; color: #d00; }
        .setup { background: #fff3cd; color: #856404; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .file-list { margin: 20px 0; }
        .file-item { padding: 10px; border-bottom: 1px solid #eee; }
        .file-item:hover { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌹 RoseGlass CloudExplorer</h1>
        <div id="status" class="status">
            <h3>Setting up your Google Drive alternative...</h3>
            <p>This is a robust Google Drive client built on Rclone technology.</p>
        </div>
        
        <div id="setup-section" style="display: none;">
            <h3>Initial Setup Required</h3>
            <p>To use RoseGlass CloudExplorer, you need to configure Rclone with your Google Drive account.</p>
            <button onclick="openSetup()">Configure Google Drive</button>
        </div>
        
        <div id="main-section" style="display: none;">
            <h3>Your Files</h3>
            <button onclick="loadFiles()">Refresh Files</button>
            <div id="file-list" class="file-list"></div>
        </div>
    </div>

    <script>
        // Check if Rclone is configured
        fetch('/api/files')
            .then(response => response.json())
            .then(data => {
                document.getElementById('main-section').style.display = 'block';
                loadFiles();
            })
            .catch(error => {
                document.getElementById('status').className = 'status setup';
                document.getElementById('status').innerHTML = '<h3>Setup Required</h3><p>Rclone is not configured yet. Please configure it to use Google Drive.</p>';
                document.getElementById('setup-section').style.display = 'block';
            });

        function loadFiles() {
            fetch('/api/files')
                .then(response => response.json())
                .then(files => {
                    const fileList = document.getElementById('file-list');
                    fileList.innerHTML = files.map(file => 
                        '<div class="file-item">' + file.Name + '</div>'
                    ).join('');
                })
                .catch(error => {
                    console.error('Error loading files:', error);
                });
        }

        function openSetup() {
            alert('To configure Rclone with Google Drive:\\n\\n1. Open Command Prompt as Administrator\\n2. Run: rclone config\\n3. Follow the setup wizard\\n4. Name your remote "remote"\\n5. Refresh this page');
        }
    </script>
</body>
</html>`;

  // Create client directory and HTML file
  const clientDir = path.join(installDir, 'client');
  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
  }
  fs.writeFileSync(path.join(clientDir, 'index.html'), htmlContent);

  // Download Rclone
  console.log('Downloading Rclone...');
  const rclonePath = path.join(installDir, 'rclone.exe');
  if (!fs.existsSync(rclonePath)) {
    try {
      const { execSync } = require('child_process');
      execSync(`powershell -Command "Invoke-WebRequest -Uri 'https://github.com/rclone/rclone/releases/download/v1.71.1/rclone-v1.71.1-windows-amd64.zip' -OutFile 'rclone.zip'"`, { cwd: installDir });
      execSync(`powershell -Command "Expand-Archive -Path 'rclone.zip' -DestinationPath '.' -Force"`, { cwd: installDir });
      execSync(`move rclone-v1.71.1-windows-amd64\\rclone.exe .`, { cwd: installDir, shell: true });
      execSync(`rmdir /s /q rclone-v1.71.1-windows-amd64`, { cwd: installDir, shell: true });
      execSync(`del rclone.zip`, { cwd: installDir, shell: true });
    } catch (error) {
      console.log('Note: Could not download Rclone automatically. Please download it manually from https://rclone.org/downloads/');
    }
  }

  console.log('Creating desktop shortcut...');
  createDesktopShortcut();

  console.log('Creating start menu shortcut...');
  createStartMenuShortcut();

  console.log('Adding to system PATH...');
  addToPath(installDir);

  console.log('');
  console.log('Installation completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run the desktop shortcut to start RoseGlass CloudExplorer');
  console.log('2. Configure Rclone with your Google Drive account');
  console.log('3. Enjoy your robust Google Drive alternative!');
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
