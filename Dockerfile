# Multi-stage Dockerfile for BugStore

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package.json and install dependencies
COPY src/frontend/package.json ./
RUN npm install

# Copy source and build
COPY src/frontend/ ./
RUN npm run build


# Stage 2: Build Caddy with Coraza WAF module
FROM caddy:builder AS caddy-builder
RUN xcaddy build \
  --with github.com/corazawaf/coraza-caddy/v2


# Stage 3: Final Image
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (curl for healthcheck)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy custom Caddy binary with Coraza WAF support
COPY --from=caddy-builder /usr/bin/caddy /usr/bin/caddy

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1 \
  PORT=8080 \
  DATABASE_URL="sqlite:////data/bugstore.db" \
  BUGSTORE_WAF_ENABLED="true" \
  BUGSTORE_SCORING_ENABLED="true"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY src/ ./src/
COPY init_db.py .
COPY seed.py .

# Copy frontend build from stage 1
COPY --from=frontend-builder /app/frontend/dist ./static

# Copy product images (after frontend build to avoid overwrite)
COPY static/images ./static/images

# Copy Caddyfile and other config
COPY Caddyfile .

# Create volume directory for persistence
RUN mkdir -p /data

# Expose ports (80/443 for Caddy with TLS, 8080 for non-WAF mode)
EXPOSE 80 443 8080

# Health Check (always checks FastAPI directly: 8000 when WAF, 8080 when no WAF)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || curl -f http://localhost:8080/api/health || exit 1

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
