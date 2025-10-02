import React, { useState } from 'react';
import './PathBar.css';

interface PathBarProps {
  path: string;
  onPathChange: (path: string) => void;
  remote?: string;
}

const PathBar: React.FC<PathBarProps> = ({ path: currentPath, onPathChange, remote }) => {
  const [editMode, setEditMode] = useState(false);
  const [editPath, setEditPath] = useState(currentPath);

  const handlePathClick = () => {
    setEditMode(true);
    setEditPath(currentPath);
  };

  const handlePathSubmit = () => {
    onPathChange(editPath);
    setEditMode(false);
  };

  const handlePathCancel = () => {
    setEditPath(currentPath);
    setEditMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePathSubmit();
    } else if (e.key === 'Escape') {
      handlePathCancel();
    }
  };

  const goUp = () => {
    if (remote) {
      // For remote paths, go up one level
      const parts = currentPath.split('/').filter(p => p.length > 0);
      if (parts.length > 0) {
        parts.pop();
        const newPath = parts.length > 0 ? '/' + parts.join('/') : '';
        onPathChange(newPath);
      }
    } else {
      // For local paths, go up one directory
      const lastSlash = currentPath.lastIndexOf('\\');
      const parentPath = lastSlash > 0 ? currentPath.substring(0, lastSlash) : currentPath.substring(0, currentPath.lastIndexOf('/'));
      if (parentPath !== currentPath && parentPath.length > 0) {
        onPathChange(parentPath);
      }
    }
  };

  const canGoUp = () => {
    if (remote) {
      return currentPath !== '' && currentPath !== '/';
    } else {
      return path.dirname(currentPath) !== currentPath;
    }
  };

  const displayPath = () => {
    if (remote) {
      return `${remote}:${currentPath || '/'}`;
    }
    return currentPath;
  };

  return (
    <div className="path-bar">
      <div className="path-controls">
        <button 
          className="up-button" 
          onClick={goUp}
          disabled={!canGoUp()}
          title="Go up one level"
        >
          ⬆️
        </button>
        
        <div className="path-display" onClick={handlePathClick}>
          {editMode ? (
            <input
              type="text"
              value={editPath}
              onChange={(e) => setEditPath(e.target.value)}
              onBlur={handlePathSubmit}
              onKeyDown={handleKeyDown}
              className="path-input"
              autoFocus
            />
          ) : (
            <span className="path-text" title={displayPath()}>
              {displayPath()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathBar;