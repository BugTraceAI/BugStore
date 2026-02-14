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


# Stage 2: Final Image
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (Caddy, curl for healthcheck)
RUN apt-get update && apt-get install -y \
  curl \
  debian-keyring \
  debian-archive-keyring \
  apt-transport-https \
  && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg \
  && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list \
  && apt-get update \
  && apt-get install -y caddy \
  && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1 \
  PORT=8080 \
  DATABASE_URL="sqlite:////data/bugstore.db" \
  BUGSTORE_WAF_ENABLED="false" \
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

# Expose port
EXPOSE 8080

# Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Start command (using a shell script to start Caddy + FastAPI if needed would be better, 
# but per specs "FastAPI serves static frontend + API + uploads from a single process" 
# we will stick to python main.py unless WAF is enabled where Caddy proxies.
# For F-032 implementation, we need a startup script to handle WAF complexity).
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
