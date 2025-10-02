import React, { useState } from 'react';
import { Task } from '../types';
import './TaskManager.css';

interface TaskManagerProps {
  tasks: Task[];
  onTaskUpdate: (tasks: Task[]) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onTaskUpdate }) => {
  const [filter, setFilter] = useState<'all' | 'running' | 'queued' | 'completed' | 'failed'>('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const cancelTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/cancel`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cancel task: ${response.statusText}`);
      }
      
      // Update local state
      onTaskUpdate(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'cancelled' as const }
          : task
      ));
    } catch (error) {
      console.error('Failed to cancel task:', error);
      alert('Failed to cancel task: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }
      
      // Update local state
      onTaskUpdate(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getStatusIcon = (status: Task['status']): string => {
    switch (status) {
      case 'queued': return '⏳';
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'cancelled': return '⏹️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: Task['status']): string => {
    switch (status) {
      case 'queued': return '#ffa500';
      case 'running': return '#007bff';
      case 'completed': return '#28a745';
      case 'failed': return '#dc3545';
      case 'cancelled': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (startTime: string, endTime?: string): string => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      queued: tasks.filter(t => t.status === 'queued').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length
    };
    return stats;
  };

  const stats = getTaskStats();

  return (
    <div className="task-manager">
      <div className="task-manager-header">
        <h2>Task Manager</h2>
        
        <div className="task-stats">
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Running:</span>
            <span className="stat-value running">{stats.running}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Queued:</span>
            <span className="stat-value queued">{stats.queued}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed:</span>
            <span className="stat-value completed">{stats.completed}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Failed:</span>
            <span className="stat-value failed">{stats.failed}</span>
          </div>
        </div>
      </div>

      <div className="task-filters">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </button>
        <button
          className={`filter-button ${filter === 'running' ? 'active' : ''}`}
          onClick={() => setFilter('running')}
        >
          Running ({stats.running})
        </button>
        <button
          className={`filter-button ${filter === 'queued' ? 'active' : ''}`}
          onClick={() => setFilter('queued')}
        >
          Queued ({stats.queued})
        </button>
        <button
          className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({stats.completed})
        </button>
        <button
          className={`filter-button ${filter === 'failed' ? 'active' : ''}`}
          onClick={() => setFilter('failed')}
        >
          Failed ({stats.failed})
        </button>
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            <span>📋</span>
            <p>No tasks found</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`task-item ${task.status}`}>
              <div className="task-header">
                <div className="task-status">
                  <span className="status-icon">{getStatusIcon(task.status)}</span>
                  <span 
                    className="status-text"
                    style={{ color: getStatusColor(task.status) }}
                  >
                    {task.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="task-actions">
                  {(task.status === 'queued' || task.status === 'running') && (
                    <button
                      className="action-button cancel-button"
                      onClick={() => cancelTask(task.id)}
                      title="Cancel task"
                    >
                      ⏹️
                    </button>
                  )}
                  
                  {(task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') && (
                    <button
                      className="action-button delete-button"
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              <div className="task-details">
                <div className="task-operation">
                  <span className="operation-icon">
                    {task.type === 'move' ? '✂️' : '📋'}
                  </span>
                  <span className="operation-text">
                    {task.type.toUpperCase()} - {task.operation || task.type}
                  </span>
                </div>

                <div className="task-paths">
                  <div className="source-path">
                    <span className="path-label">From:</span>
                    <span className="path-text">
                      {task.sourceRemote ? `${task.sourceRemote}:` : ''}{task.sourcePath}
                    </span>
                  </div>
                  <div className="dest-path">
                    <span className="path-label">To:</span>
                    <span className="path-text">
                      {task.destRemote ? `${task.destRemote}:` : ''}{task.destPath}
                    </span>
                  </div>
                </div>

                {task.status === 'running' && (
                  <div className="task-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {task.progress.toFixed(1)}%
                      {task.speed && ` • ${task.speed}`}
                      {task.eta && ` • ETA: ${task.eta}`}
                    </div>
                  </div>
                )}

                {task.error && (
                  <div className="task-error">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{task.error}</span>
                  </div>
                )}

                <div className="task-timing">
                  <span className="created-time">
                    Created: {new Date(task.createdAt).toLocaleString()}
                  </span>
                  {task.startTime && (
                    <span className="duration">
                      Duration: {formatDuration(task.startTime, task.endTime)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager;
