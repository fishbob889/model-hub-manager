import { ModelFolder, DiskUsage, DownloadJob } from '@/types/model';

const API_BASE = '/api';

export const api = {
  async getModels(): Promise<ModelFolder[]> {
    const response = await fetch(`${API_BASE}/models`);
    if (!response.ok) throw new Error('Failed to fetch models');
    return response.json();
  },

  async getDiskUsage(): Promise<DiskUsage> {
    const response = await fetch(`${API_BASE}/disk-usage`);
    if (!response.ok) throw new Error('Failed to fetch disk usage');
    return response.json();
  },

  async downloadModel(modelId: string, folderName: string, token?: string): Promise<DownloadJob> {
    const response = await fetch(`${API_BASE}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelId, folderName, token }),
    });
    if (!response.ok) throw new Error('Failed to start download');
    return response.json();
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
