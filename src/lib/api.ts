import { ModelFolder, DiskUsage, DownloadJob } from '@/types/model';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Simulated data for development
const mockModels: ModelFolder[] = [
  {
    name: 'llama-2-7b',
    size: '13.5 GB',
    sizeBytes: 13500000000,
    lastModified: '2024-01-15T10:30:00Z',
    files: 8,
  },
  {
    name: 'mistral-7b-instruct',
    size: '14.2 GB',
    sizeBytes: 14200000000,
    lastModified: '2024-01-10T08:15:00Z',
    files: 12,
  },
  {
    name: 'codellama-13b',
    size: '26.1 GB',
    sizeBytes: 26100000000,
    lastModified: '2024-01-08T14:45:00Z',
    files: 10,
  },
];

const mockDiskUsage: DiskUsage = {
  used: '53.8 GB',
  total: '500 GB',
  percentage: 10.76,
  usedBytes: 53800000000,
  totalBytes: 500000000000,
};

export const api = {
  async getModels(): Promise<ModelFolder[]> {
    try {
      const response = await fetch(`${API_BASE}/models`);
      if (!response.ok) throw new Error('Failed to fetch models');
      return response.json();
    } catch {
      console.log('Using mock data - backend not available');
      return mockModels;
    }
  },

  async getDiskUsage(): Promise<DiskUsage> {
    try {
      const response = await fetch(`${API_BASE}/disk-usage`);
      if (!response.ok) throw new Error('Failed to fetch disk usage');
      return response.json();
    } catch {
      console.log('Using mock data - backend not available');
      return mockDiskUsage;
    }
  },

  async downloadModel(modelId: string, folderName: string): Promise<DownloadJob> {
    try {
      const response = await fetch(`${API_BASE}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, folderName }),
      });
      if (!response.ok) throw new Error('Failed to start download');
      return response.json();
    } catch {
      // Return mock job for development
      return {
        id: `job-${Date.now()}`,
        modelId,
        folderName,
        status: 'downloading',
        progress: 0,
        logs: [`Starting download of ${modelId}...`],
        startedAt: new Date().toISOString(),
      };
    }
  },

  async deleteModel(folderName: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/models/${folderName}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete model');
    } catch {
      console.log('Mock delete - backend not available');
    }
  },
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
