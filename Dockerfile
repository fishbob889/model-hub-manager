# LLM Model Manager Backend
# This Dockerfile sets up the Node.js backend with Python and huggingface-cli

FROM node:20-slim

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Install huggingface CLI tools
RUN pip3 install --break-system-packages huggingface_hub[cli]

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

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
