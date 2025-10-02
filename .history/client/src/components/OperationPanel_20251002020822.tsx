import React from 'react';
import { FileItem } from '../types';
import './OperationPanel.css';

interface OperationPanelProps {
  selectedFiles: FileItem[];
  onOperation: (operation: 'move' | 'copy') => void;
  onClearSelection: () => void;
}

const OperationPanel: React.FC<OperationPanelProps> = ({
  selectedFiles,
  onOperation,
  onClearSelection
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = (): number => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  };

  const getFileCount = (): { files: number; dirs: number } => {
    return selectedFiles.reduce(
      (count, file) => ({
        files: count.files + (file.isDir ? 0 : 1),
        dirs: count.dirs + (file.isDir ? 1 : 0)
      }),
      { files: 0, dirs: 0 }
    );
  };

  if (selectedFiles.length === 0) {
    return (
      <div className="operation-panel empty">
        <div className="empty-message">
          <span>📁</span>
          <p>Select files to perform operations</p>
        </div>
      </div>
    );
  }

  const { files, dirs } = getFileCount();
  const totalSize = getTotalSize();

  return (
    <div className="operation-panel">
      <div className="selection-info">
        <div className="selection-summary">
          <span className="file-count">
            {selectedFiles.length} item{selectedFiles.length !== 1 ? 's' : ''} selected
          </span>
          <span className="file-breakdown">
            ({files} file{files !== 1 ? 's' : ''}, {dirs} folder{dirs !== 1 ? 's' : ''})
          </span>
          <span className="total-size">
            Total size: {formatFileSize(totalSize)}
          </span>
        </div>
        
        <button 
          className="clear-selection"
          onClick={onClearSelection}
          title="Clear selection"
        >
          ✕
        </button>
      </div>

      <div className="operation-buttons">
        <button
          className="operation-button move-button"
          onClick={() => onOperation('move')}
          title="Cut and move files (delete from source)"
        >
          ✂️ Move ({selectedFiles.length})
        </button>
        
        <button
          className="operation-button copy-button"
          onClick={() => onOperation('copy')}
          title="Copy files (keep original)"
        >
          📋 Copy ({selectedFiles.length})
        </button>
      </div>

      <div className="selected-files-list">
        <div className="files-header">Selected Files:</div>
        <div className="files-list">
          {selectedFiles.slice(0, 10).map((file, index) => (
            <div key={`${file.path}-${index}`} className="selected-file-item">
              <span className="file-icon">
                {file.isDir ? '📁' : '📄'}
              </span>
              <span className="file-name" title={file.name}>
                {file.name}
              </span>
              <span className="file-size">
                {file.isDir ? '—' : formatFileSize(file.size)}
              </span>
            </div>
          ))}
          {selectedFiles.length > 10 && (
            <div className="more-files">
              ... and {selectedFiles.length - 10} more files
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationPanel;
