#!/bin/bash
set -e

echo "🐛 Starting BugStore..."

# Initialize database if it doesn't exist
if [ ! -f /data/bugstore.db ]; then
    echo "📦 Initializing database..."
    python3 init_db.py
    
    # Seed database if AUTO_SEED is enabled
    if [ "${BUGSTORE_AUTO_SEED:-false}" = "true" ]; then
        echo "🌱 Seeding database with test data..."
        python3 seed.py
    fi
fi

WORKERS=${BUGSTORE_WORKERS:-4}
TIMEOUT=${BUGSTORE_TIMEOUT:-30}

if [ "${BUGSTORE_WAF_ENABLED:-false}" = "true" ]; then
    echo "🛡️ WAF enabled — starting Caddy + FastAPI (${WORKERS} workers, ${TIMEOUT}s timeout)..."
    caddy start --config /app/Caddyfile --adapter caddyfile
    cd /app && python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers "$WORKERS" --timeout-keep-alive "$TIMEOUT"
else
    echo "🚀 Starting FastAPI server (${WORKERS} workers, ${TIMEOUT}s timeout)..."
    cd /app && python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8080 --workers "$WORKERS" --timeout-keep-alive "$TIMEOUT"
fi
