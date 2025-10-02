export interface RcloneStatus {
  installed: boolean;
  version?: string;
  hasConfig: boolean;
  remotes: string[];
  rclonePath: string;
  error?: string;
}

export interface FileItem {
  name: string;
  path: string;
  size: number;
  isDir: boolean;
  modTime: string;
  mimeType?: string;
  remote?: string;
}

export interface Task {
  id: string;
  type: 'move' | 'copy';
  operation?: string;
  sourcePath: string;
  destPath: string;
  sourceRemote?: string;
  destRemote?: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  error?: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  output?: string;
  errorOutput?: string;
  speed?: string;
  eta?: string;
  totalSize?: number;
}

export interface TaskProgress {
  progress: number;
  totalSize?: number;
  unit?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
