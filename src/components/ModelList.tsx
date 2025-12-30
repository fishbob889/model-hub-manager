import { useState } from 'react';
import { Folder, Trash2, FileCode, Clock } from 'lucide-react';
import { ModelFolder } from '@/types/model';
import { formatDate } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { DeleteModal } from '@/components/DeleteModal';

interface ModelListProps {
  models: ModelFolder[];
  onDelete: (folderName: string) => void;
  isLoading?: boolean;
}

export const ModelList = ({ models, onDelete, isLoading }: ModelListProps) => {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg p-6 card-glow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Model Folders</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-secondary/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-lg p-6 card-glow animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Model Folders</h3>
            <p className="text-xs text-muted-foreground">{models.length} models installed</p>
          </div>
        </div>

        {models.length === 0 ? (
          <div className="text-center py-8">
            <Folder className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No models downloaded yet</p>
            <p className="text-sm text-muted-foreground/70">Use the form below to download your first model</p>
          </div>
        ) : (
          <div className="space-y-3">
            {models.map((model, index) => (
              <div
                key={model.name}
                className="group flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-border/50 transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Folder className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-mono font-medium text-foreground">{model.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileCode className="w-3 h-3" />
                        {model.files} files
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(model.lastModified)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-primary">{model.size}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteTarget(model.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        folderName={deleteTarget || ''}
      />
    </>
  );
};
