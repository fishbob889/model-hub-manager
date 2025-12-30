import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Header } from '@/components/Header';
import { DiskUsage } from '@/components/DiskUsage';
import { ModelList } from '@/components/ModelList';
import { DownloadForm } from '@/components/DownloadForm';
import { LogViewer } from '@/components/LogViewer';
import { api } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ModelFolder, DiskUsage as DiskUsageType } from '@/types/model';

const Index = () => {
  const [models, setModels] = useState<ModelFolder[]>([]);
  const [diskUsage, setDiskUsage] = useState<DiskUsageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const { logs, isConnected, clearLogs, simulateDownload, connect } = useWebSocket();

  useEffect(() => {
    loadData();
    // Try to connect WebSocket
    connect();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [modelsData, diskData] = await Promise.all([
        api.getModels(),
        api.getDiskUsage(),
      ]);
      setModels(modelsData);
      setDiskUsage(diskData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (modelId: string, folderName: string, token?: string) => {
    setIsDownloading(true);
    clearLogs();

    try {
      await api.downloadModel(modelId, folderName, token);
      toast.success(`Started downloading ${modelId}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
      setIsDownloading(false);
    }
  };

  const handleDelete = async (folderName: string) => {
    try {
      await api.deleteModel(folderName);
      setModels((prev) => prev.filter((m) => m.name !== folderName));
      toast.success(`Deleted ${folderName}`);
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete model');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster 
        position="top-right" 
        theme="dark"
        toastOptions={{
          className: 'bg-card border-border text-foreground',
        }}
      />
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Stats and Download Form */}
          <div className="space-y-6">
            {diskUsage && <DiskUsage data={diskUsage} />}
            <DownloadForm onSubmit={handleDownload} isDownloading={isDownloading} />
          </div>

          {/* Right column - Model List and Logs */}
          <div className="lg:col-span-2 space-y-6">
            <ModelList 
              models={models} 
              onDelete={handleDelete} 
              isLoading={isLoading} 
            />
            <LogViewer 
              logs={logs} 
              isConnected={isConnected} 
              onClear={clearLogs} 
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-muted-foreground text-center font-mono">
            Model storage: <span className="text-primary">/data/models</span> • 
            Backend: <span className="text-primary">localhost:3000</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
