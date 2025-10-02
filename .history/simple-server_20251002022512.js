const express = require('express');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
const RcloneService = require('./services/RcloneService');
const RcloneInstaller = require('./services/RcloneInstaller');
const FileManager = require('./services/FileManager');
const TaskQueue = require('./services/TaskQueue');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Initialize services
const rcloneInstaller = new RcloneInstaller();
const rcloneService = new RcloneService();
const fileManager = new FileManager();
const taskQueue = new TaskQueue(rcloneService, fileManager);

// WebSocket for real-time updates
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Broadcast function for WebSocket
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// API Routes

// Get Rclone status and remotes
app.get('/api/rclone/status', async (req, res) => {
  try {
    const status = await rcloneInstaller.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Install Rclone
app.post('/api/rclone/install', async (req, res) => {
  try {
    await rcloneInstaller.install();
    const status = await rcloneInstaller.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configure Google Drive
app.post('/api/rclone/configure', async (req, res) => {
  try {
    await rcloneInstaller.configureGoogleDrive();
    const status = await rcloneInstaller.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List files in a directory
app.post('/api/files/list', async (req, res) => {
  try {
    const { path, remote } = req.body;
    const files = await fileManager.listFiles(path, remote);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get file info
app.post('/api/files/info', async (req, res) => {
  try {
    const { path, remote } = req.body;
    const info = await fileManager.getFileInfo(path, remote);
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Queue a move operation (cut-paste)
app.post('/api/operations/move', async (req, res) => {
  try {
    const { sourcePath, destPath, sourceRemote, destRemote, operation } = req.body;
    const taskId = await taskQueue.queueMove(sourcePath, destPath, sourceRemote, destRemote, operation);
    res.json({ taskId, message: 'Operation queued successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Queue a copy operation
app.post('/api/operations/copy', async (req, res) => {
  try {
    const { sourcePath, destPath, sourceRemote, destRemote } = req.body;
    const taskId = await taskQueue.queueCopy(sourcePath, destPath, sourceRemote, destRemote);
    res.json({ taskId, message: 'Operation queued successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task status
app.get('/api/tasks/:taskId', async (req, res) => {
  try {
    const task = await taskQueue.getTask(req.params.taskId);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await taskQueue.getAllTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel a task
app.post('/api/tasks/:taskId/cancel', async (req, res) => {
  try {
    await taskQueue.cancelTask(req.params.taskId);
    res.json({ message: 'Task cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Rclone configuration
app.get('/api/rclone/config', async (req, res) => {
  try {
    const config = await rcloneService.getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Rclone connection
app.post('/api/rclone/test', async (req, res) => {
  try {
    const { remote } = req.body;
    const result = await rcloneService.testConnection(remote);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`RoseGlass CloudExplorer running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// Initialize and start task queue
(async () => {
  await taskQueue.start();
  
  // Set up task progress broadcasting
  taskQueue.on('progress', (taskId, progress) => {
    broadcast({ type: 'task_progress', taskId, progress });
  });
  
  taskQueue.on('complete', (taskId, result) => {
    broadcast({ type: 'task_complete', taskId, result });
  });
  
  taskQueue.on('error', (taskId, error) => {
    broadcast({ type: 'task_error', taskId, error: error.message });
  });
})();
