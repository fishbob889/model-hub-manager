import { useState, useEffect, useRef, useCallback } from 'react';
import { LogEntry } from '@/types/model';

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (data: LogEntry) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onSuccess?: (data: LogEntry) => void;
  onDownloadError?: (data: LogEntry) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = options.url || `${protocol}//${window.location.host}/ws`;

  const connect = useCallback(() => {
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        options.onOpen?.();
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as LogEntry;
          setLogs((prev) => [...prev, data]);
          options.onMessage?.(data);
          
          // Trigger callbacks based on message type
          if (data.type === 'success') {
            options.onSuccess?.(data);
          } else if (data.type === 'error') {
            options.onDownloadError?.(data);
          }
        } catch {
          // Handle plain text messages
          const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            message: event.data,
            type: 'info',
          };
          setLogs((prev) => [...prev, logEntry]);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        options.onClose?.();
        console.log('WebSocket disconnected');
        
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        options.onError?.(error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [wsUrl, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  const sendMessage = useCallback((message: string | object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(data);
    }
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Simulate logs for development when backend is not available
  const simulateDownload = useCallback((modelId: string) => {
    const stages = [
      { message: `Fetching model info for ${modelId}...`, type: 'info' as const },
      { message: 'Downloading config.json...', type: 'progress' as const },
      { message: 'Downloading tokenizer.json...', type: 'progress' as const },
      { message: 'Downloading model-00001-of-00002.safetensors (6.5 GB)...', type: 'progress' as const },
      { message: '  [████████████████████████████████] 100%', type: 'progress' as const },
      { message: 'Downloading model-00002-of-00002.safetensors (6.5 GB)...', type: 'progress' as const },
      { message: '  [████████████████████████████████] 100%', type: 'progress' as const },
      { message: 'Download complete!', type: 'success' as const },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < stages.length) {
        const entry: LogEntry = {
          timestamp: new Date().toISOString(),
          message: stages[index].message,
          type: stages[index].type,
        };
        setLogs((prev) => [...prev, entry]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    logs,
    connect,
    disconnect,
    sendMessage,
    clearLogs,
    simulateDownload,
  };
};
