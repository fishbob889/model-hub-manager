export interface ModelFolder {
  name: string;
  size: string;
  sizeBytes: number;
  lastModified: string;
  files: number;
}

export interface DiskUsage {
  used: string;
  total: string;
  percentage: number;
  usedBytes: number;
  totalBytes: number;
}

export interface DownloadJob {
  id: string;
  modelId: string;
  folderName: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number;
  logs: string[];
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'progress';
}
