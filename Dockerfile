# LLM Model Manager Backend
# This Dockerfile sets up the Node.js backend with Python and huggingface-cli

FROM node:20-slim

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment and install huggingface_hub
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir huggingface_hub[cli]

# Verify huggingface-cli is installed
RUN huggingface-cli --version

# Create app directory
WORKDIR /app

# Create models directory
RUN mkdir -p /data/models

# Copy package files
COPY backend/package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy backend source code
COPY backend/ .

# Expose ports
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
