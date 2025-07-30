#!/bin/bash

echo "🚀 Creating new branch with complete Docker + Clerk + Gemini setup..."

# Step 1: Create and switch to new branch
git checkout -b feature/docker-clerk-gemini-complete

echo "✅ Created new branch: feature/docker-clerk-gemini-complete"

# Step 2: Create Dockerfile.api
cat > Dockerfile.api << 'EOF'
# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    bash

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server source code
COPY server/ ./server/
COPY .env ./

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs

# Set permissions
RUN chown -R node:node /app
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server/server.js"]
EOF

echo "✅ Created Dockerfile.api"

# Step 3: Create client Dockerfile
cat > client/Dockerfile << 'EOF'
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

echo "✅ Created client/Dockerfile"

# Step 4: Create client nginx config
cat > client/nginx.conf << 'EOF'
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html index.htm;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

echo "✅ Created client/nginx.conf"

# Step 5: Create nginx directory and config
mkdir -p nginx
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:5000;
    }

    upstream web {
        server web:3000;
    }

    server {
        listen 80;
        server_name localhost;

        # API routes
        location /api/ {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://api/health;
        }

        # Frontend
        location / {
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_Set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

echo "✅ Created nginx/nginx.conf"

# Step 6: Update docker-compose.yml (remove version and fix services)
cat > docker-compose.yml << 'EOF'
services:
  # PostgreSQL Database
  postgres:
    image: postgres:15
    container_name: pharmacy_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: pharmacy_db
      POSTGRES_USER: pharmacy_user
      POSTGRES_PASSWORD: pharmacy_secure_password
      POSTGRES_HOST_AUTH_METHOD: trust
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - pharmacy_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pharmacy_user -d pharmacy_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis for Caching and Sessions
  redis:
    image: redis:7-alpine
    container_name: pharmacy_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass pharmacy_redis_password
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - pharmacy_network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # ChromaDB for Vector Database (AI Knowledge Base)
  chromadb:
    image: chromadb/chroma:latest
    container_name: pharmacy_chromadb
    restart: unless-stopped
    environment:
      - CHROMA_HOST=0.0.0.0
      - CHROMA_PORT=8000
      - ALLOW_RESET=TRUE
    volumes:
      - chromadb_data:/chroma/chroma
    ports:
      - "8000:8000"
    networks:
      - pharmacy_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/heartbeat"]
      interval: 30s
      timeout: 10s
      retries: 3

  # API Server (Node.js + Express)
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: pharmacy_api
    restart: unless-stopped
    environment:
      # Database Configuration
      - DATABASE_URL=postgresql://pharmacy_user:pharmacy_secure_password@postgres:5432/pharmacy_db
      
      # Redis Configuration
      - REDIS_URL=redis://:pharmacy_redis_password@redis:6379
      
      # Clerk Authentication
      - CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      
      # AI Services
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
      
      # ChromaDB
      - CHROMA_HOST=chromadb
      - CHROMA_PORT=8000
      
      # Server Configuration
      - NODE_ENV=production
      - PORT=5000
      - CORS_ORIGIN=http://localhost:3000
      
      # Security
      - JWT_SECRET=${JWT_SECRET:-pharmacy_jwt_secret_change_in_production}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY:-pharmacy_encryption_key_32_chars}
      - SESSION_SECRET=${SESSION_SECRET:-pharmacy_session_secret_change_me}
      
      # External Services
      - AFRICAS_TALKING_USERNAME=${AFRICAS_TALKING_USERNAME:-sandbox}
      - AFRICAS_TALKING_API_KEY=${AFRICAS_TALKING_API_KEY}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    ports:
      - "5000:5000"
    networks:
      - pharmacy_network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      chromadb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Web Client (React + Vite)
  web:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: pharmacy_web
    restart: unless-stopped
    environment:
      - VITE_CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}
      - VITE_API_BASE_URL=http://localhost:5000/api
    ports:
      - "3000:3000"
    networks:
      - pharmacy_network
    depends_on:
      - api
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: pharmacy_nginx
    restart: unless-stopped
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
      - "443:443"
    networks:
      - pharmacy_network
    depends_on:
      - api
      - web
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  chromadb_data:
    driver: local

networks:
  pharmacy_network:
    driver: bridge
EOF

echo "✅ Updated docker-compose.yml"

# Step 7: Create .dockerignore files
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.git
.gitignore
README.md
.env.local
.env.development.local
.env.test.local
.env.production.local
coverage
.nyc_output
client/node_modules
client/dist
client/.env.local
logs
*.log
.DS_Store
EOF

cat > client/.dockerignore << 'EOF'
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.git
.gitignore
README.md
.env.local
.env.development.local
.env.test.local
.env.production.local
coverage
.nyc_output
dist
.DS_Store
EOF

echo "✅ Created .dockerignore files"

# Step 8: Remove OPENAI_API_KEY from .env if it exists
if grep -q "OPENAI_API_KEY" .env; then
    sed -i '/OPENAI_API_KEY/d' .env
    echo "✅ Removed OPENAI_API_KEY from .env"
fi

# Step 9: Create comprehensive documentation
cat > DOCKER_SETUP.md << 'EOF'
# 🐳 PharmaCare Docker Setup

Complete containerized setup for the AI-Powered Pharmacy Management System with Clerk authentication and Gemini AI.

## 🚀 Quick Start

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f api
