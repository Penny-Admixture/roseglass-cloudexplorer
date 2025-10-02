import React, { useState, useEffect } from 'react';
import { RcloneStatus, FileItem, Task } from '../types';
import FileList from './FileList';
import PathBar from './PathBar';
import RemoteSelector from './RemoteSelector';
import OperationPanel from './OperationPanel';
import './FileBrowser.css';

interface FileBrowserProps {
  rcloneStatus: RcloneStatus | null;
  onTaskCreated: (task: Task) => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ rcloneStatus, onTaskCreated }) => {
  const [leftRemote, setLeftRemote] = useState<string>('');
  const [rightRemote, setRightRemote] = useState<string>('');
  const [leftPath, setLeftPath] = useState<string>('');
  const [rightPath, setRightPath] = useState<string>('');
  const [leftFiles, setLeftFiles] = useState<FileItem[]>([]);
  const [rightFiles, setRightFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [activePanel, setActivePanel] = useState<'left' | 'right'>('left');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Set default paths
    if (!leftPath) {
      setLeftPath(process.platform === 'win32' ? 'C:\\' : '/');
    }
    if (!rightPath && rcloneStatus?.remotes.length) {
      setRightRemote(rcloneStatus.remotes[0]);
      setRightPath('');
    }
  }, [rcloneStatus, leftPath, rightPath]);

  useEffect(() => {
    loadFiles('left');
  }, [leftPath, leftRemote]);

  useEffect(() => {
    loadFiles('right');
  }, [rightPath, rightRemote]);

  const loadFiles = async (panel: 'left' | 'right') => {
    setLoading(true);
    setError('');
    
    try {
      const path = panel === 'left' ? leftPath : rightPath;
      const remote = panel === 'left' ? leftRemote : rightRemote;
      
      const response = await fetch('/api/files/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, remote: remote || null })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load files: ${response.statusText}`);
      }
      
      const files = await response.json();
      
      if (panel === 'left') {
        setLeftFiles(files);
      } else {
        setRightFiles(files);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: FileItem, multiSelect: boolean = false) => {
    if (multiSelect) {
      setSelectedFiles(prev => {
        const exists = prev.some(f => f.path === file.path);
        if (exists) {
          return prev.filter(f => f.path !== file.path);
        } else {
          return [...prev, file];
        }
      });
    } else {
      setSelectedFiles([file]);
    }
  };

  const handleFileDoubleClick = (file: FileItem) => {
    if (file.isDir) {
      const newPath = file.remote ? file.path : file.path;
      if (activePanel === 'left') {
        setLeftPath(newPath);
      } else {
        setRightPath(newPath);
      }
    }
  };

  const handlePathChange = (path: string, panel: 'left' | 'right') => {
    if (panel === 'left') {
      setLeftPath(path);
    } else {
      setRightPath(path);
    }
  };

  const handleRemoteChange = (remote: string, panel: 'left' | 'right') => {
    if (panel === 'left') {
      setLeftRemote(remote);
      setLeftPath('');
    } else {
      setRightRemote(remote);
      setRightPath('');
    }
  };

  const handleOperation = async (operation: 'move' | 'copy') => {
    if (selectedFiles.length === 0) {
      alert('Please select files to operate on');
      return;
    }

    const sourcePanel = activePanel;
    const destPanel = sourcePanel === 'left' ? 'right' : 'left';
    
    const sourceRemote = sourcePanel === 'left' ? leftRemote : rightRemote;
    const destRemote = destPanel === 'left' ? leftRemote : rightRemote;
    const destPath = destPanel === 'left' ? leftPath : rightPath;

    try {
      for (const file of selectedFiles) {
        const response = await fetch('/api/operations/' + operation, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourcePath: file.path,
            destPath: destPath + (destPath.endsWith('/') || destPath.endsWith('\\') ? '' : '/') + file.name,
            sourceRemote: sourceRemote || null,
            destRemote: destRemote || null,
            operation: operation
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to queue ${operation} operation: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Create task object for UI
        const task: Task = {
          id: result.taskId,
          type: operation,
          operation: operation,
          sourcePath: file.path,
          destPath: destPath + '/' + file.name,
          sourceRemote: sourceRemote || undefined,
          destRemote: destRemote || undefined,
          status: 'queued',
          progress: 0,
          createdAt: new Date().toISOString()
        };

        onTaskCreated(task);
      }

      setSelectedFiles([]);
      
      // Refresh destination panel
      loadFiles(destPanel);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error(`Failed to ${operation} files:`, err);
    }
  };

  const refreshPanel = (panel: 'left' | 'right') => {
    loadFiles(panel);
  };

  return (
    <div className="file-browser">
      <div className="browser-header">
        <h2>File Browser</h2>
        <div className="browser-controls">
          <button onClick={() => refreshPanel('left')} disabled={loading}>
            Refresh Left
          </button>
          <button onClick={() => refreshPanel('right')} disabled={loading}>
            Refresh Right
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="browser-panels">
        {/* Left Panel */}
        <div className={`browser-panel ${activePanel === 'left' ? 'active' : ''}`}>
          <div className="panel-header">
            <RemoteSelector
              remotes={rcloneStatus?.remotes || []}
              selectedRemote={leftRemote}
              onRemoteChange={(remote) => handleRemoteChange(remote, 'left')}
              label="Local/Remote"
            />
            <PathBar
              path={leftPath}
              onPathChange={(path) => handlePathChange(path, 'left')}
              remote={leftRemote}
            />
          </div>
          <FileList
            files={leftFiles}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
            onFileDoubleClick={handleFileDoubleClick}
            loading={loading}
            onClick={() => setActivePanel('left')}
          />
        </div>

        {/* Right Panel */}
        <div className={`browser-panel ${activePanel === 'right' ? 'active' : ''}`}>
          <div className="panel-header">
            <RemoteSelector
              remotes={rcloneStatus?.remotes || []}
              selectedRemote={rightRemote}
              onRemoteChange={(remote) => handleRemoteChange(remote, 'right')}
              label="Local/Remote"
            />
            <PathBar
              path={rightPath}
              onPathChange={(path) => handlePathChange(path, 'right')}
              remote={rightRemote}
            />
          </div>
          <FileList
            files={rightFiles}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
            onFileDoubleClick={handleFileDoubleClick}
            loading={loading}
            onClick={() => setActivePanel('right')}
          />
        </div>
      </div>

      <OperationPanel
        selectedFiles={selectedFiles}
        onOperation={handleOperation}
        onClearSelection={() => setSelectedFiles([])}
      />
    </div>
  );
};

export default FileBrowser;
