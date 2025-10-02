const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');
const { execa } = require('execa');
const Store = require('electron-store');

// Initialize electron-store for settings
const store = new Store();

// Keep a global reference of the window object
let mainWindow;
let serverProcess;

// Rclone configuration
const RCLONE_VERSION = '1.65.2';
const RCLONE_URL = `https://github.com/rclone/rclone/releases/download/v${RCLONE_VERSION}/rclone-v${RCLONE_VERSION}-windows-amd64.zip`;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, '../assets/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../client/build/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Check Rclone status on startup
    checkRcloneStatus();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Configure Google Drive',
          click: () => configureGoogleDrive()
        },
        {
          label: 'Check Rclone Status',
          click: () => checkRcloneStatus()
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About RoseGlass CloudExplorer',
          click: () => showAboutDialog()
        },
        {
          label: 'Open Documentation',
          click: () => shell.openExternal('https://github.com/roseglass/cloudexplorer')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function checkRcloneStatus() {
  try {
    const rclonePath = path.join(__dirname, '../rclone/rclone.exe');
    
    if (!fs.existsSync(rclonePath)) {
      await downloadAndInstallRclone();
      return;
    }

    // Test Rclone
    const { stdout } = await execa(rclonePath, ['version'], { encoding: 'utf8' });
    const version = stdout.split('\n')[0];
    
    // Check if configured
    const configPath = path.join(process.env.APPDATA, 'rclone', 'rclone.conf');
    const hasConfig = fs.existsSync(configPath);
    
    if (mainWindow) {
      mainWindow.webContents.send('rclone-status', {
        installed: true,
        version,
        hasConfig,
        rclonePath
      });
    }

    if (!hasConfig) {
      showRcloneSetupDialog();
    }

  } catch (error) {
    console.error('Rclone check failed:', error);
    
    if (mainWindow) {
      mainWindow.webContents.send('rclone-status', {
        installed: false,
        error: error.message
      });
    }
  }
}

async function downloadAndInstallRclone() {
  try {
    const rcloneDir = path.join(__dirname, '../rclone');
    
    // Create rclone directory
    if (!fs.existsSync(rcloneDir)) {
      fs.mkdirSync(rcloneDir, { recursive: true });
    }

    const zipPath = path.join(rcloneDir, 'rclone.zip');
    
    // Show progress dialog
    if (mainWindow) {
      mainWindow.webContents.send('rclone-download-progress', { status: 'downloading' });
    }

    // Download Rclone
    await downloadFile(RCLONE_URL, zipPath);
    
    // Extract
    if (mainWindow) {
      mainWindow.webContents.send('rclone-download-progress', { status: 'extracting' });
    }

    const extract = require('extract-zip');
    await extract(zipPath, { dir: rcloneDir });
    
    // Clean up zip file
    fs.unlinkSync(zipPath);
    
    // Move rclone.exe to the root of rclone directory
    const extractedDir = path.join(rcloneDir, `rclone-v${RCLONE_VERSION}-windows-amd64`);
    const rcloneExe = path.join(extractedDir, 'rclone.exe');
    const targetExe = path.join(rcloneDir, 'rclone.exe');
    
    if (fs.existsSync(rcloneExe)) {
      fs.copyFileSync(rcloneExe, targetExe);
      fs.rmSync(extractedDir, { recursive: true, force: true });
    }

    if (mainWindow) {
      mainWindow.webContents.send('rclone-download-progress', { status: 'completed' });
    }

    // Check status again
    setTimeout(() => checkRcloneStatus(), 1000);

  } catch (error) {
    console.error('Failed to download Rclone:', error);
    
    if (mainWindow) {
      mainWindow.webContents.send('rclone-download-progress', { 
        status: 'error', 
        error: error.message 
      });
    }
  }
}

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function configureGoogleDrive() {
  try {
    const rclonePath = path.join(__dirname, '../rclone/rclone.exe');
    
    if (!fs.existsSync(rclonePath)) {
      await downloadAndInstallRclone();
      return;
    }

    // Run rclone config
    const configProcess = spawn(rclonePath, ['config'], {
      stdio: 'inherit',
      shell: true
    });

    configProcess.on('close', (code) => {
      if (code === 0) {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Configuration Complete',
          message: 'Google Drive has been configured successfully!',
          buttons: ['OK']
        });
        
        // Refresh status
        checkRcloneStatus();
      }
    });

  } catch (error) {
    dialog.showErrorBox('Configuration Error', `Failed to configure Google Drive: ${error.message}`);
  }
}

function showRcloneSetupDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: 'Google Drive Setup Required',
    message: 'Google Drive needs to be configured before you can use the application.',
    detail: 'Would you like to configure Google Drive now?',
    buttons: ['Configure Now', 'Later'],
    defaultId: 0
  }).then((result) => {
    if (result.response === 0) {
      configureGoogleDrive();
    }
  });
}

function showAboutDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'About RoseGlass CloudExplorer',
    message: 'RoseGlass CloudExplorer v1.0.0',
    detail: 'A robust Google Drive client built on Rclone with AirCluster-like functionality.\n\nBuilt with Electron and React.',
    buttons: ['OK']
  });
}

function startServer() {
  const serverPath = path.join(__dirname, '../server.js');
  
  serverProcess = spawn('node', [serverPath], {
    stdio: 'pipe',
    shell: true
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
  startServer();
});

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopServer();
});

// Handle app protocol for deep linking
app.setAsDefaultProtocolClient('roseglass-cloudexplorer');

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
