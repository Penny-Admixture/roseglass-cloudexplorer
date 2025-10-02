import React from 'react';
import { RcloneStatus } from '../types';
import './StatusBar.css';

interface StatusBarProps {
  rcloneStatus: RcloneStatus | null;
  taskCount: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ rcloneStatus, taskCount }) => {
  const getRcloneStatusText = (): string => {
    if (!rcloneStatus) {
      return 'Checking Rclone status...';
    }
    
    if (!rcloneStatus.installed) {
      return '❌ Rclone not installed';
    }
    
    if (!rcloneStatus.hasConfig) {
      return '⚠️ Rclone not configured';
    }
    
    return `✅ Rclone ${rcloneStatus.version} (${rcloneStatus.remotes.length} remotes)`;
  };

  const getRcloneStatusColor = (): string => {
    if (!rcloneStatus) {
      return '#ffa500';
    }
    
    if (!rcloneStatus.installed) {
      return '#dc3545';
    }
    
    if (!rcloneStatus.hasConfig) {
      return '#ffa500';
    }
    
    return '#28a745';
  };

  return (
    <div className="status-bar">
      <div className="status-left">
        <div 
          className="rclone-status"
          style={{ color: getRcloneStatusColor() }}
        >
          {getRcloneStatusText()}
        </div>
      </div>
      
      <div className="status-right">
        <div className="task-count">
          {taskCount > 0 ? (
            <span className="active-tasks">
              🔄 {taskCount} active task{taskCount !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="no-tasks">No active tasks</span>
          )}
        </div>
        
        <div className="app-version">
          RoseGlass CloudExplorer v1.0.0
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
