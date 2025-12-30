import { useState } from 'react';
import { Download, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface DownloadFormProps {
  onSubmit: (modelId: string, folderName: string) => void;
  isDownloading: boolean;
}

export const DownloadForm = ({ onSubmit, isDownloading }: DownloadFormProps) => {
  const [modelId, setModelId] = useState('');
  const [folderName, setFolderName] = useState('');

  const handleModelIdChange = (value: string) => {
    setModelId(value);
    // Auto-generate folder name from model ID
    if (!folderName || folderName === generateFolderName(modelId)) {
      setFolderName(generateFolderName(value));
    }
  };

  const generateFolderName = (id: string): string => {
    const parts = id.split('/');
    return parts[parts.length - 1]?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!modelId.trim()) {
      toast.error('Please enter a model ID');
      return;
    }

    if (!folderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    // Validate folder name
    if (!/^[a-z0-9-]+$/.test(folderName)) {
      toast.error('Folder name must contain only lowercase letters, numbers, and hyphens');
      return;
    }

    onSubmit(modelId.trim(), folderName.trim());
  };

  return (
    <div className="bg-card rounded-lg p-6 card-glow animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Download Model</h3>
          <p className="text-xs text-muted-foreground">From Hugging Face Hub</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="modelId" className="text-sm font-medium">
            Hugging Face Model ID
          </Label>
          <div className="relative">
            <Input
              id="modelId"
              type="text"
              placeholder="meta-llama/Llama-2-7b"
              value={modelId}
              onChange={(e) => handleModelIdChange(e.target.value)}
              disabled={isDownloading}
              className="font-mono bg-secondary/50 border-border focus:border-primary pr-10"
            />
            <a
              href={modelId ? `https://huggingface.co/${modelId}` : 'https://huggingface.co/models'}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            e.g., microsoft/phi-2, TheBloke/Llama-2-7B-GGUF
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="folderName" className="text-sm font-medium">
            Local Folder Name
          </Label>
          <Input
            id="folderName"
            type="text"
            placeholder="llama-2-7b"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value.toLowerCase())}
            disabled={isDownloading}
            className="font-mono bg-secondary/50 border-border focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            Will be saved to /data/models/{folderName || '<folder-name>'}
          </p>
        </div>

        <Button
          type="submit"
          disabled={isDownloading || !modelId.trim() || !folderName.trim()}
          className="w-full"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Start Download
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
