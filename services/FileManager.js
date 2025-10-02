const fs = require('fs').promises;
const path = require('path');
const RcloneService = require('./RcloneService');

class FileManager {
  constructor() {
    this.rcloneService = new RcloneService();
  }

  async listFiles(filePath, remote = null) {
    try {
      if (remote) {
        // List remote files
        const files = await this.rcloneService.listFiles(remote, filePath, {
          recursive: false,
          maxDepth: 1,
          includeDir: false
        });
        
        // Also get directories
        const dirs = await this.rcloneService.listFiles(remote, filePath, {
          recursive: false,
          maxDepth: 1,
          includeDir: true
        });

        // Combine and format
        const allItems = [...files, ...dirs].map(item => ({
          name: item.Name,
          path: item.Path,
          size: item.Size || 0,
          isDir: item.IsDir || false,
          modTime: item.ModTime,
          mimeType: item.MimeType || null,
          remote: remote
        }));

        return allItems.sort((a, b) => {
          // Directories first, then files, both alphabetically
          if (a.isDir && !b.isDir) return -1;
          if (!a.isDir && b.isDir) return 1;
          return a.name.localeCompare(b.name);
        });
      } else {
        // List local files
        const items = await fs.readdir(filePath, { withFileTypes: true });
        
        const files = await Promise.all(items.map(async (item) => {
          const fullPath = path.join(filePath, item.name);
          const stats = await fs.stat(fullPath);
          
          return {
            name: item.name,
            path: fullPath,
            size: stats.size,
            isDir: item.isDirectory(),
            modTime: stats.mtime.toISOString(),
            mimeType: null,
            remote: null
          };
        }));

        return files.sort((a, b) => {
          // Directories first, then files, both alphabetically
          if (a.isDir && !b.isDir) return -1;
          if (!a.isDir && b.isDir) return 1;
          return a.name.localeCompare(b.name);
        });
      }
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  async getFileInfo(filePath, remote = null) {
    try {
      if (remote) {
        // Get remote file info
        const files = await this.rcloneService.listFiles(remote, filePath, {
          recursive: false,
          maxDepth: 1
        });
        
        const file = files.find(f => f.Path === filePath);
        if (!file) {
          throw new Error('File not found');
        }

        return {
          name: file.Name,
          path: file.Path,
          size: file.Size || 0,
          isDir: file.IsDir || false,
          modTime: file.ModTime,
          mimeType: file.MimeType || null,
          remote: remote
        };
      } else {
        // Get local file info
        const stats = await fs.stat(filePath);
        
        return {
          name: path.basename(filePath),
          path: filePath,
          size: stats.size,
          isDir: stats.isDirectory(),
          modTime: stats.mtime.toISOString(),
          mimeType: null,
          remote: null
        };
      }
    } catch (error) {
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  async createDirectory(dirPath, remote = null) {
    try {
      if (remote) {
        await this.rcloneService.mkdir(remote, dirPath);
      } else {
        await fs.mkdir(dirPath, { recursive: true });
      }
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  }

  async deleteFile(filePath, remote = null) {
    try {
      if (remote) {
        await this.rcloneService.delete(remote, filePath);
      } else {
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
          await fs.rmdir(filePath, { recursive: true });
        } else {
          await fs.unlink(filePath);
        }
      }
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getDirectorySize(dirPath, remote = null) {
    try {
      if (remote) {
        const sizeOutput = await this.rcloneService.size(remote, dirPath);
        // Parse size output (format: "123456 bytes")
        const match = sizeOutput.match(/(\d+)\s+bytes/);
        return match ? parseInt(match[1]) : 0;
      } else {
        const stats = await fs.stat(dirPath);
        if (stats.isDirectory()) {
          // For local directories, we'd need to recursively calculate
          // For now, return the directory's own size
          return stats.size;
        } else {
          return stats.size;
        }
      }
    } catch (error) {
      throw new Error(`Failed to get directory size: ${error.message}`);
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}

module.exports = FileManager;
