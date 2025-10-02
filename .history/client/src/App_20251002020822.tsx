import React, { useState, useEffect } from 'react';
import './App.css';
import FileBrowser from './components/FileBrowser';
import TaskManager from './components/TaskManager';
import StatusBar from './components/StatusBar';
import { RcloneStatus, Task } from './types';

const App: React.FC = () => {
  const [rcloneStatus, setRcloneStatus] = useState<RcloneStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'browser' | 'tasks'>('browser');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const websocket = new WebSocket('ws://localhost:3000');
    websocket.onopen = () => {
      console.log('WebSocket connected');
      setWs(websocket);
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
    };

    // Load initial data
    loadRcloneStatus();
    loadTasks();

    return () => {
      websocket.close();
    };
  }, []);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'task_progress':
        setTasks(prev => prev.map(task => 
          task.id === data.taskId 
            ? { ...task, progress: data.progress.progress, ...data.progress }
            : task
        ));
        break;
      case 'task_complete':
        setTasks(prev => prev.map(task => 
          task.id === data.taskId 
            ? { ...task, status: 'completed', progress: 100 }
            : task
        ));
        break;
      case 'task_error':
        setTasks(prev => prev.map(task => 
          task.id === data.taskId 
            ? { ...task, status: 'failed', error: data.error }
            : task
        ));
        break;
    }
  };

  const loadRcloneStatus = async () => {
    try {
      const response = await fetch('/api/rclone/status');
      const status = await response.json();
      setRcloneStatus(status);
    } catch (error) {
      console.error('Failed to load Rclone status:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const tasksData = await response.json();
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const addTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>RoseGlass CloudExplorer</h1>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'browser' ? 'active' : ''}
            onClick={() => setActiveTab('browser')}
          >
            File Browser
          </button>
          <button 
            className={activeTab === 'tasks' ? 'active' : ''}
            onClick={() => setActiveTab('tasks')}
          >
            Task Manager ({tasks.filter(t => t.status === 'running' || t.status === 'queued').length})
          </button>
        </div>
      </header>

      <main className="App-main">
        {activeTab === 'browser' && (
          <FileBrowser 
            rcloneStatus={rcloneStatus}
            onTaskCreated={addTask}
          />
        )}
        {activeTab === 'tasks' && (
          <TaskManager 
            tasks={tasks}
            onTaskUpdate={setTasks}
          />
        )}
      </main>

      <StatusBar 
        rcloneStatus={rcloneStatus}
        taskCount={tasks.filter(t => t.status === 'running' || t.status === 'queued').length}
      />
    </div>
  );
};

export default App;