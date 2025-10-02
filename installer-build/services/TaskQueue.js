const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class TaskQueue extends EventEmitter {
  constructor(rcloneService, fileManager) {
    super();
    this.rcloneService = rcloneService;
    this.fileManager = fileManager;
    this.tasks = new Map();
    this.running = false;
    this.maxConcurrent = 3;
    this.activeTasks = new Set();
  }

  async start() {
    this.running = true;
    this.processQueue();
  }

  stop() {
    this.running = false;
  }

  async queueMove(sourcePath, destPath, sourceRemote, destRemote, operation = 'move') {
    const taskId = uuidv4();
    const task = {
      id: taskId,
      type: 'move',
      operation,
      sourcePath,
      destPath,
      sourceRemote,
      destRemote,
      status: 'queued',
      progress: 0,
      error: null,
      startTime: null,
      endTime: null,
      createdAt: new Date().toISOString()
    };

    this.tasks.set(taskId, task);
    this.emit('queued', taskId, task);
    return taskId;
  }

  async queueCopy(sourcePath, destPath, sourceRemote, destRemote) {
    const taskId = uuidv4();
    const task = {
      id: taskId,
      type: 'copy',
      sourcePath,
      destPath,
      sourceRemote,
      destRemote,
      status: 'queued',
      progress: 0,
      error: null,
      startTime: null,
      endTime: null,
      createdAt: new Date().toISOString()
    };

    this.tasks.set(taskId, task);
    this.emit('queued', taskId, task);
    return taskId;
  }

  async getTask(taskId) {
    return this.tasks.get(taskId) || null;
  }

  async getAllTasks() {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  async cancelTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status === 'running') {
      // Try to kill the process if possible
      if (task.process) {
        try {
          task.process.kill('SIGTERM');
        } catch (error) {
          console.error('Failed to kill task process:', error);
        }
      }
    }

    task.status = 'cancelled';
    task.endTime = new Date().toISOString();
    this.activeTasks.delete(taskId);
    
    this.emit('cancelled', taskId, task);
    return task;
  }

  async processQueue() {
    while (this.running) {
      if (this.activeTasks.size < this.maxConcurrent) {
        const queuedTask = this.getNextQueuedTask();
        if (queuedTask) {
          this.executeTask(queuedTask);
        }
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  getNextQueuedTask() {
    for (const [taskId, task] of this.tasks) {
      if (task.status === 'queued') {
        return task;
      }
    }
    return null;
  }

  async executeTask(task) {
    this.activeTasks.add(task.id);
    task.status = 'running';
    task.startTime = new Date().toISOString();
    
    this.emit('started', task.id, task);

    try {
      let process;
      
      if (task.type === 'move') {
        process = await this.rcloneService.move(
          task.sourcePath,
          task.destPath,
          task.sourceRemote,
          task.destRemote,
          {
            progress: true,
            transfers: 4,
            checkers: 8,
            retries: 3,
            lowLevelRetries: 10
          }
        );
      } else if (task.type === 'copy') {
        process = await this.rcloneService.copy(
          task.sourcePath,
          task.destPath,
          task.sourceRemote,
          task.destRemote,
          {
            progress: true,
            transfers: 4,
            checkers: 8,
            retries: 3,
            lowLevelRetries: 10
          }
        );
      }

      task.process = process;

      // Handle process output
      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
        this.parseProgress(data.toString(), task);
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
        this.parseProgress(data.toString(), task);
      });

      // Wait for completion
      const result = await process;
      
      task.status = 'completed';
      task.progress = 100;
      task.endTime = new Date().toISOString();
      task.output = output;
      task.errorOutput = errorOutput;

      this.emit('complete', task.id, task);
      
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.endTime = new Date().toISOString();
      
      this.emit('error', task.id, error);
    } finally {
      this.activeTasks.delete(task.id);
    }
  }

  parseProgress(output, task) {
    // Parse Rclone progress output
    // Format: "Transferred: 1.234 GB / 5.678 GB, 21.7%, 123.45 MB/s, ETA 0s"
    const progressMatch = output.match(/Transferred:\s+[\d.]+\s+\w+\s+\/\s+([\d.]+)\s+(\w+),\s+([\d.]+)%/);
    if (progressMatch) {
      const totalSize = parseFloat(progressMatch[1]);
      const unit = progressMatch[2];
      const percentage = parseFloat(progressMatch[3]);
      
      task.progress = Math.min(percentage, 100);
      
      // Convert to bytes for better tracking
      const multiplier = this.getSizeMultiplier(unit);
      task.totalSize = totalSize * multiplier;
      
      this.emit('progress', task.id, {
        progress: task.progress,
        totalSize: task.totalSize,
        unit: unit
      });
    }

    // Parse speed information
    const speedMatch = output.match(/([\d.]+)\s+(\w+\/s)/);
    if (speedMatch) {
      task.speed = speedMatch[1] + ' ' + speedMatch[2];
    }

    // Parse ETA
    const etaMatch = output.match(/ETA\s+([\d.]+[smh])/);
    if (etaMatch) {
      task.eta = etaMatch[1];
    }
  }

  getSizeMultiplier(unit) {
    const multipliers = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024
    };
    return multipliers[unit] || 1;
  }

  getQueueStatus() {
    const total = this.tasks.size;
    const queued = Array.from(this.tasks.values()).filter(t => t.status === 'queued').length;
    const running = this.activeTasks.size;
    const completed = Array.from(this.tasks.values()).filter(t => t.status === 'completed').length;
    const failed = Array.from(this.tasks.values()).filter(t => t.status === 'failed').length;
    const cancelled = Array.from(this.tasks.values()).filter(t => t.status === 'cancelled').length;

    return {
      total,
      queued,
      running,
      completed,
      failed,
      cancelled
    };
  }
}

module.exports = TaskQueue;
