const { execa } = require('execa');
const path = require('path');
const fs = require('fs').promises;

class RcloneService {
  constructor() {
    this.rclonePath = this.findRclonePath();
    this.configPath = path.join(process.cwd(), 'rclone.conf');
  }

  findRclonePath() {
    // Common Rclone installation paths
    const possiblePaths = [
      'rclone', // If in PATH
      'C:\\Tools\\rclone\\rclone.exe',
      'C:\\Program Files\\rclone\\rclone.exe',
      'C:\\rclone\\rclone.exe',
      path.join(process.cwd(), 'rclone', 'rclone.exe'),
      path.join(process.cwd(), 'rclone.exe')
    ];

    for (const rclonePath of possiblePaths) {
      try {
        // Test if rclone exists and is executable
        require('child_process').execSync(`${rclonePath} version`, { stdio: 'ignore' });
        return rclonePath;
      } catch (error) {
        // Continue to next path
      }
    }

    throw new Error('Rclone not found. Please install Rclone and ensure it\'s in your PATH or in one of the common installation directories.');
  }

  async getStatus() {
    try {
      const { stdout } = await execa(this.rclonePath, ['version'], { encoding: 'utf8' });
      const version = stdout.split('\n')[0];
      
      // Check if config exists
      let hasConfig = false;
      let remotes = [];
      
      try {
        const configExists = await fs.access(this.configPath).then(() => true).catch(() => false);
        if (configExists) {
          hasConfig = true;
          const { stdout: configOutput } = await execa(this.rclonePath, ['listremotes'], { encoding: 'utf8' });
          remotes = configOutput.trim().split('\n').filter(remote => remote.length > 0);
        }
      } catch (error) {
        // Config doesn't exist or is invalid
      }

      return {
        installed: true,
        version,
        hasConfig,
        remotes,
        rclonePath: this.rclonePath
      };
    } catch (error) {
      return {
        installed: false,
        error: error.message,
        rclonePath: this.rclonePath
      };
    }
  }

  async getConfig() {
    try {
      const configExists = await fs.access(this.configPath).then(() => true).catch(() => false);
      if (!configExists) {
        return { exists: false };
      }

      const { stdout } = await execa(this.rclonePath, ['config', 'dump'], { encoding: 'utf8' });
      return {
        exists: true,
        config: JSON.parse(stdout)
      };
    } catch (error) {
      throw new Error(`Failed to read Rclone config: ${error.message}`);
    }
  }

  async testConnection(remote) {
    try {
      const { stdout } = await execa(this.rclonePath, ['lsd', remote + ':', '--max-depth', '1'], { 
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

  async listFiles(remote, path = '', options = {}) {
    const args = ['lsjson', remote + ':' + path];
    
    if (options.recursive) {
      args.push('--recursive');
    }
    
    if (options.maxDepth) {
      args.push('--max-depth', options.maxDepth.toString());
    }

    if (options.includeDir) {
      args.push('--dirs-only');
    }

    const { stdout } = await execa(this.rclonePath, args, { encoding: 'utf8' });
    return JSON.parse(stdout);
  }

  async move(sourcePath, destPath, sourceRemote, destRemote, options = {}) {
    const args = ['move'];
    
    // Add source
    if (sourceRemote) {
      args.push(sourceRemote + ':' + sourcePath);
    } else {
      args.push(sourcePath);
    }
    
    // Add destination
    if (destRemote) {
      args.push(destRemote + ':' + destPath);
    } else {
      args.push(destPath);
    }

    // Add options
    if (options.progress) {
      args.push('--progress');
    }
    
    if (options.transfers) {
      args.push('--transfers', options.transfers.toString());
    }
    
    if (options.checkers) {
      args.push('--checkers', options.checkers.toString());
    }
    
    if (options.retries) {
      args.push('--retries', options.retries.toString());
    }
    
    if (options.lowLevelRetries) {
      args.push('--low-level-retries', options.lowLevelRetries.toString());
    }

    // Add rate limiting for Google Drive
    if (sourceRemote && sourceRemote.includes('gdrive')) {
      args.push('--drive-pacer-min-sleep', '100ms');
      args.push('--drive-pacer-burst', '100');
    }

    return execa(this.rclonePath, args, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  }

  async copy(sourcePath, destPath, sourceRemote, destRemote, options = {}) {
    const args = ['copy'];
    
    // Add source
    if (sourceRemote) {
      args.push(sourceRemote + ':' + sourcePath);
    } else {
      args.push(sourcePath);
    }
    
    // Add destination
    if (destRemote) {
      args.push(destRemote + ':' + destPath);
    } else {
      args.push(destPath);
    }

    // Add options (same as move)
    if (options.progress) {
      args.push('--progress');
    }
    
    if (options.transfers) {
      args.push('--transfers', options.transfers.toString());
    }
    
    if (options.checkers) {
      args.push('--checkers', options.checkers.toString());
    }
    
    if (options.retries) {
      args.push('--retries', options.retries.toString());
    }
    
    if (options.lowLevelRetries) {
      args.push('--low-level-retries', options.lowLevelRetries.toString());
    }

    // Add rate limiting for Google Drive
    if (sourceRemote && sourceRemote.includes('gdrive')) {
      args.push('--drive-pacer-min-sleep', '100ms');
      args.push('--drive-pacer-burst', '100');
    }

    return execa(this.rclonePath, args, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  }

  async delete(remote, path) {
    const args = ['delete', remote + ':' + path];
    return execa(this.rclonePath, args, { encoding: 'utf8' });
  }

  async mkdir(remote, path) {
    const args = ['mkdir', remote + ':' + path];
    return execa(this.rclonePath, args, { encoding: 'utf8' });
  }

  async size(remote, path) {
    const args = ['size', remote + ':' + path];
    const { stdout } = await execa(this.rclonePath, args, { encoding: 'utf8' });
    return stdout;
  }
}

module.exports = RcloneService;
