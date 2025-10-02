const { execa } = require('execa');
const fs = require('fs').promises;
const path = require('path');

async function buildInstaller() {
  console.log('🔨 Building RoseGlass CloudExplorer Installer...\n');

  try {
    // Step 1: Install dependencies
    console.log('📦 Installing dependencies...');
    await execa('npm', ['install'], { stdio: 'inherit' });
    await execa('npm', ['run', 'install-client'], { stdio: 'inherit' });

    // Step 2: Build React app
    console.log('⚛️  Building React application...');
    await execa('npm', ['run', 'build'], { stdio: 'inherit' });

    // Step 3: Download Rclone
    console.log('⬇️  Downloading Rclone...');
    await downloadRclone();

    // Step 4: Build Electron app
    console.log('🔧 Building Electron application...');
    await execa('npm', ['run', 'dist-win-msi'], { stdio: 'inherit' });

    // Step 5: Create final installer package
    console.log('📦 Creating installer package...');
    await createInstallerPackage();

    console.log('\n✅ Installer build completed successfully!');
    console.log('📁 Output: dist/RoseGlassCloudExplorer-Setup.msi');
    console.log('📁 Output: dist/RoseGlassCloudExplorer-Setup.exe');

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

async function downloadRclone() {
  const rcloneDir = path.join(__dirname, 'rclone');
  const rcloneVersion = '1.65.2';
  const rcloneUrl = `https://github.com/rclone/rclone/releases/download/v${rcloneVersion}/rclone-v${rcloneVersion}-windows-amd64.zip`;
  
  try {
    // Create rclone directory
    await fs.mkdir(rcloneDir, { recursive: true });

    // Download Rclone
    const https = require('https');
    const extract = require('extract-zip');
    const zipPath = path.join(rcloneDir, 'rclone.zip');

    console.log('  Downloading Rclone...');
    await downloadFile(rcloneUrl, zipPath);

    console.log('  Extracting Rclone...');
    await extract(zipPath, { dir: rcloneDir });

    // Move rclone.exe to the root of rclone directory
    const extractedDir = path.join(rcloneDir, `rclone-v${rcloneVersion}-windows-amd64`);
    const rcloneExe = path.join(extractedDir, 'rclone.exe');
    const targetExe = path.join(rcloneDir, 'rclone.exe');
    
    if (await fileExists(rcloneExe)) {
      await fs.copyFile(rcloneExe, targetExe);
      await fs.rmdir(extractedDir, { recursive: true });
    }

    // Clean up zip file
    await fs.unlink(zipPath);

    console.log('  ✅ Rclone downloaded and extracted successfully');

  } catch (error) {
    throw new Error(`Failed to download Rclone: ${error.message}`);
  }
}

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const file = require('fs').createWriteStream(filePath);
    
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
        require('fs').unlink(filePath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function createInstallerPackage() {
  const distDir = path.join(__dirname, 'dist');
  const packageDir = path.join(distDir, 'installer-package');
  
  try {
    // Create package directory
    await fs.mkdir(packageDir, { recursive: true });

    // Copy installer files
    const installerFiles = [
      'installer/nsis-installer.nsh',
      'installer/msi-installer.wxs',
      'LICENSE',
      'README.md',
      'INSTALL.md'
    ];

    for (const file of installerFiles) {
      const sourcePath = path.join(__dirname, file);
      const destPath = path.join(packageDir, path.basename(file));
      
      if (await fileExists(sourcePath)) {
        await fs.copyFile(sourcePath, destPath);
      }
    }

    // Create installer info file
    const installerInfo = {
      version: '1.0.0',
      buildDate: new Date().toISOString(),
      files: [
        'RoseGlassCloudExplorer-Setup.msi',
        'RoseGlassCloudExplorer-Setup.exe'
      ],
      description: 'RoseGlass CloudExplorer - A robust Google Drive client with integrated Rclone'
    };

    await fs.writeFile(
      path.join(packageDir, 'installer-info.json'),
      JSON.stringify(installerInfo, null, 2)
    );

    console.log('  ✅ Installer package created');

  } catch (error) {
    throw new Error(`Failed to create installer package: ${error.message}`);
  }
}

// Run the build
if (require.main === module) {
  buildInstaller();
}

module.exports = { buildInstaller };
