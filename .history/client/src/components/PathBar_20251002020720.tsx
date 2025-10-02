import React, { useState } from 'react';
import * as path from 'path';
import './PathBar.css';

interface PathBarProps {
  path: string;
  onPathChange: (path: string) => void;
  remote?: string;
}

const PathBar: React.FC<PathBarProps> = ({ path, onPathChange, remote }) => {
  const [editMode, setEditMode] = useState(false);
  const [editPath, setEditPath] = useState(path);

  const handlePathClick = () => {
    setEditMode(true);
    setEditPath(path);
  };

  const handlePathSubmit = () => {
    onPathChange(editPath);
    setEditMode(false);
  };

  const handlePathCancel = () => {
    setEditPath(path);
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
      const parts = path.split('/').filter(p => p.length > 0);
      if (parts.length > 0) {
        parts.pop();
        const newPath = parts.length > 0 ? '/' + parts.join('/') : '';
        onPathChange(newPath);
      }
    } else {
      // For local paths, go up one directory
      const pathObj = require('path');
      const parentPath = pathObj.dirname(path);
      if (parentPath !== path) {
        onPathChange(parentPath);
      }
    }
  };

  const canGoUp = () => {
    if (remote) {
      return path !== '' && path !== '/';
    } else {
      const pathObj = require('path');
      return pathObj.dirname(path) !== path;
    }
  };

  const displayPath = () => {
    if (remote) {
      return `${remote}:${path || '/'}`;
    }
    return path;
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
