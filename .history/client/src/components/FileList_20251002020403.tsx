import React from 'react';
import { FileItem } from '../types';
import './FileList.css';

interface FileListProps {
  files: FileItem[];
  selectedFiles: FileItem[];
  onFileSelect: (file: FileItem, multiSelect?: boolean) => void;
  onFileDoubleClick: (file: FileItem) => void;
  loading: boolean;
  onClick: () => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  selectedFiles,
  onFileSelect,
  onFileDoubleClick,
  loading,
  onClick
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isSelected = (file: FileItem): boolean => {
    return selectedFiles.some(f => f.path === file.path);
  };

  const handleFileClick = (file: FileItem, event: React.MouseEvent) => {
    event.stopPropagation();
    onFileSelect(file, event.ctrlKey || event.metaKey);
  };

  const handleFileDoubleClick = (file: FileItem, event: React.MouseEvent) => {
    event.stopPropagation();
    onFileDoubleClick(file);
  };

  const getFileIcon = (file: FileItem): string => {
    if (file.isDir) {
      return '📁';
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'txt':
      case 'md':
      case 'log':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
        return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'mkv':
        return '🎥';
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
        return '🎵';
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return '📦';
      case 'pdf':
        return '📕';
      case 'doc':
      case 'docx':
        return '📘';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      case 'exe':
      case 'msi':
        return '⚙️';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="file-list loading" onClick={onClick}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading files...</span>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="file-list empty" onClick={onClick}>
        <div className="empty-message">
          <span>📁</span>
          <p>No files found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-list" onClick={onClick}>
      <div className="file-list-header">
        <div className="file-header-name">Name</div>
        <div className="file-header-size">Size</div>
        <div className="file-header-date">Modified</div>
      </div>
      
      <div className="file-list-content">
        {files.map((file, index) => (
          <div
            key={`${file.path}-${index}`}
            className={`file-item ${isSelected(file) ? 'selected' : ''} ${file.isDir ? 'directory' : 'file'}`}
            onClick={(e) => handleFileClick(file, e)}
            onDoubleClick={(e) => handleFileDoubleClick(file, e)}
          >
            <div className="file-icon">
              {getFileIcon(file)}
            </div>
            
            <div className="file-name" title={file.name}>
              {file.name}
            </div>
            
            <div className="file-size">
              {file.isDir ? '—' : formatFileSize(file.size)}
            </div>
            
            <div className="file-date">
              {formatDate(file.modTime)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
