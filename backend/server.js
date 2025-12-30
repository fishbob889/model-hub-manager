const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3001;
const MODELS_DIR = '/data/models';

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Store active WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast message to all connected clients
function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(data);
    }
  });
}

// Helper: Get folder size
function getFolderSize(folderPath) {
  let totalSize = 0;
  try {
    const files = fs.readdirSync(folderPath, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(folderPath, file.name);
      if (file.isDirectory()) {
        totalSize += getFolderSize(filePath);
      } else {
        totalSize += fs.statSync(filePath).size;
      }
    }
  } catch (error) {
    console.error('Error calculating folder size:', error);
  }
  return totalSize;
}

// Helper: Format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Helper: Count files in folder
function countFiles(folderPath) {
  let count = 0;
  try {
    const files = fs.readdirSync(folderPath, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        count += countFiles(path.join(folderPath, file.name));
      } else {
        count++;
      }
    }
  } catch (error) {
    console.error('Error counting files:', error);
  }
  return count;
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get disk usage
app.get('/api/disk-usage', (req, res) => {
  try {
    // Ensure directory exists
    if (!fs.existsSync(MODELS_DIR)) {
      fs.mkdirSync(MODELS_DIR, { recursive: true });
    }

    const usedBytes = getFolderSize(MODELS_DIR);
    // For demo, assume 500GB total disk space
    const totalBytes = 500 * 1024 * 1024 * 1024;
    const percentage = (usedBytes / totalBytes) * 100;

    res.json({
      used: formatBytes(usedBytes),
      total: formatBytes(totalBytes),
      percentage: parseFloat(percentage.toFixed(2)),
      usedBytes,
      totalBytes,
    });
  } catch (error) {
    console.error('Error getting disk usage:', error);
    res.status(500).json({ error: 'Failed to get disk usage' });
  }
});

// List models
app.get('/api/models', (req, res) => {
  try {
    // Ensure directory exists
    if (!fs.existsSync(MODELS_DIR)) {
      fs.mkdirSync(MODELS_DIR, { recursive: true });
      return res.json([]);
    }

    const folders = fs.readdirSync(MODELS_DIR, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => {
        const folderPath = path.join(MODELS_DIR, dirent.name);
        const stats = fs.statSync(folderPath);
        const sizeBytes = getFolderSize(folderPath);

        return {
          name: dirent.name,
          size: formatBytes(sizeBytes),
          sizeBytes,
          lastModified: stats.mtime.toISOString(),
          files: countFiles(folderPath),
        };
      })
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    res.json(folders);
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({ error: 'Failed to list models' });
  }
});

// Download model
app.post('/api/download', (req, res) => {
  const { modelId, folderName } = req.body;

  if (!modelId || !folderName) {
    return res.status(400).json({ error: 'modelId and folderName are required' });
  }

  // Validate folder name (prevent path traversal)
  if (!/^[a-z0-9-]+$/.test(folderName)) {
    return res.status(400).json({ error: 'Invalid folder name' });
  }

  const targetDir = path.join(MODELS_DIR, folderName);
  const jobId = `job-${Date.now()}`;

  // Send initial response
  res.json({
    id: jobId,
    modelId,
    folderName,
    status: 'downloading',
    progress: 0,
    logs: [],
    startedAt: new Date().toISOString(),
  });

  // Start download process
  broadcast({
    timestamp: new Date().toISOString(),
    message: `Starting download of ${modelId}...`,
    type: 'info',
  });

  const downloadProcess = spawn('huggingface-cli', [
    'download',
    modelId,
    '--local-dir',
    targetDir,
  ]);

  downloadProcess.stdout.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      broadcast({
        timestamp: new Date().toISOString(),
        message,
        type: 'progress',
      });
    }
  });

  downloadProcess.stderr.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      // HuggingFace CLI outputs progress to stderr
      const type = message.toLowerCase().includes('error') ? 'error' : 'progress';
      broadcast({
        timestamp: new Date().toISOString(),
        message,
        type,
      });
    }
  });

  downloadProcess.on('close', (code) => {
    if (code === 0) {
      broadcast({
        timestamp: new Date().toISOString(),
        message: `Successfully downloaded ${modelId} to ${targetDir}`,
        type: 'success',
      });
    } else {
      broadcast({
        timestamp: new Date().toISOString(),
        message: `Download failed with exit code ${code}`,
        type: 'error',
      });
    }
  });

  downloadProcess.on('error', (error) => {
    broadcast({
      timestamp: new Date().toISOString(),
      message: `Download error: ${error.message}`,
      type: 'error',
    });
  });
});

// Delete model
app.delete('/api/models/:folderName', (req, res) => {
  const { folderName } = req.params;

  // Validate folder name (prevent path traversal)
  if (!/^[a-z0-9-]+$/.test(folderName)) {
    return res.status(400).json({ error: 'Invalid folder name' });
  }

  const folderPath = path.join(MODELS_DIR, folderName);

  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ error: 'Model folder not found' });
  }

  try {
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.log(`Deleted model folder: ${folderPath}`);
    res.json({ success: true, message: `Deleted ${folderName}` });
  } catch (error) {
    console.error('Error deleting model:', error);
    res.status(500).json({ error: 'Failed to delete model' });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
  console.log(`Models directory: ${MODELS_DIR}`);

  // Ensure models directory exists
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
    console.log(`Created models directory: ${MODELS_DIR}`);
  }
});
