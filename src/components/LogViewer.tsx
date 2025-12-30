import { useEffect, useRef } from 'react';
import { Terminal, Trash2, Circle } from 'lucide-react';
import { LogEntry } from '@/types/model';
import { Button } from '@/components/ui/button';

interface LogViewerProps {
  logs: LogEntry[];
  isConnected: boolean;
  onClear: () => void;
}

export const LogViewer = ({ logs, isConnected, onClear }: LogViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'text-destructive';
      case 'success':
        return 'text-terminal-text';
      case 'progress':
        return 'text-primary';
      default:
        return 'text-foreground/80';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden card-glow animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-terminal-bg rounded-lg">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Download Logs</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Circle
                className={`w-2 h-2 ${isConnected ? 'fill-terminal-text text-terminal-text' : 'fill-muted-foreground text-muted-foreground'}`}
              />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={logs.length === 0}
          className="text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      <div
        ref={containerRef}
        className="h-64 overflow-y-auto bg-terminal-bg p-4 font-mono text-sm terminal-glow"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground/50">
            <p>Waiting for download logs...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`flex gap-3 animate-fade-in ${getLogColor(log.type)}`}
              >
                <span className="text-muted-foreground/50 shrink-0">
                  [{formatTime(log.timestamp)}]
                </span>
                <span className="break-all">{log.message}</span>
              </div>
            ))}
            <div className="h-1 w-2 bg-primary animate-pulse-glow" />
          </div>
        )}
      </div>
    </div>
  );
};
