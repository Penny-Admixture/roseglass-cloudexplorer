const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { execa } = require('execa');
const extract = require('extract-zip');

class RcloneInstaller {
  constructor() {
    this.rcloneVersion = '1.65.2';
    this.rcloneUrl = `https://github.com/rclone/rclone/releases/download/v${this.rcloneVersion}/rclone-v${this.rcloneVersion}-windows-amd64.zip`;
    this.installDir = path.join(process.cwd(), 'rclone');
    this.rcloneExe = path.join(this.installDir, 'rclone.exe');
  }

  async isInstalled() {
    try {
      await fs.access(this.rcloneExe);
      return true;
    } catch {
      return false;
    }
  }

  async getVersion() {
    try {
      const { stdout } = await execa(this.rcloneExe, ['version'], { encoding: 'utf8' });
      return stdout.split('\n')[0];
    } catch {
      return null;
    }
  }

  async install() {
    try {
      // Create install directory
      await fs.mkdir(this.installDir, { recursive: true });

      // Download Rclone
      const zipPath = path.join(this.installDir, 'rclone.zip');
      await this.downloadFile(this.rcloneUrl, zipPath);

      // Extract
      const extractDir = path.join(this.installDir, 'extract');
      await extract(zipPath, { dir: extractDir });

      // Find and move rclone.exe
      const extractedDir = path.join(extractDir, `rclone-v${this.rcloneVersion}-windows-amd64`);
      const sourceExe = path.join(extractedDir, 'rclone.exe');
      
      if (await this.fileExists(sourceExe)) {
        await fs.copyFile(sourceExe, this.rcloneExe);
      } else {
        throw new Error('rclone.exe not found in extracted files');
      }

      // Clean up
      await fs.unlink(zipPath);
      await fs.rmdir(extractDir, { recursive: true });

      return true;
    } catch (error) {
      throw new Error(`Failed to install Rclone: ${error.message}`);
    }
  }

  async downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
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

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async configureGoogleDrive() {
    try {
      if (!await this.isInstalled()) {
        throw new Error('Rclone is not installed');
      }

      // Run rclone config
      const configProcess = execa(this.rcloneExe, ['config'], {
        stdio: 'inherit',
        shell: true
      });

      await configProcess;
      return true;
    } catch (error) {
      throw new Error(`Failed to configure Google Drive: ${error.message}`);
    }
  }

  async getConfigPath() {
    return path.join(process.env.APPDATA, 'rclone', 'rclone.conf');
  }

  async hasConfiguration() {
    try {
      const configPath = await this.getConfigPath();
      await fs.access(configPath);
      return true;
    } catch {
      return false;
    }
  }

  async getRemotes() {
    try {
      if (!await this.isInstalled()) {
        return [];
      }

      const { stdout } = await execa(this.rcloneExe, ['listremotes'], { encoding: 'utf8' });
      return stdout.trim().split('\n').filter(remote => remote.length > 0);
    } catch {
      return [];
    }
  }

  async testConnection(remote) {
    try {
      if (!await this.isInstalled()) {
        throw new Error('Rclone is not installed');
      }

      const { stdout } = await execa(this.rcloneExe, [
        'lsd', 
        remote + ':', 
        '--max-depth', 
        '1'
      ], { 
        encoding: 'utf8',
        timeout: 10000
      });
      
      return {
        success: true,
        message: 'Connection successful',
        output: stdout
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        output: error.stdout || error.stderr || ''
      };
    }
  }

  async getStatus() {
    const installed = await this.isInstalled();
    const version = installed ? await this.getVersion() : null;
    const hasConfig = installed ? await this.hasConfiguration() : false;
    const remotes = installed ? await this.getRemotes() : [];

    return {
      installed,
      version,
      hasConfig,
      remotes,
      rclonePath: this.rcloneExe,
      installDir: this.installDir
    };
  }
}

module.exports = RcloneInstaller;
