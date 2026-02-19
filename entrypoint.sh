#!/bin/bash
set -e

echo "🐛 Starting BugStore..."

# Wait for database to be ready (MySQL/MariaDB)
if echo "$DATABASE_URL" | grep -q "mysql"; then
    echo "⏳ Waiting for MySQL..."
    for i in $(seq 1 30); do
        python3 -c "
from sqlalchemy import create_engine, text
import os
e = create_engine(os.environ['DATABASE_URL'])
with e.connect() as c:
    c.execute(text('SELECT 1'))
" 2>/dev/null && break
        echo "  Attempt $i/30 — retrying in 2s..."
        sleep 2
    done
fi

# Initialize database tables
echo "📦 Initializing database..."
python3 init_db.py

# Seed database if AUTO_SEED is enabled and tables are empty
if [ "${BUGSTORE_AUTO_SEED:-true}" = "true" ]; then
    ROWS=$(python3 -c "
from src.database import SessionLocal
from src.models import User
db = SessionLocal()
print(db.query(User).count())
db.close()
" 2>/dev/null || echo "0")
    if [ "$ROWS" = "0" ]; then
        echo "🌱 Seeding database with test data..."
        python3 seed.py
    else
        echo "✓ Database already seeded ($ROWS users found)"
    fi
fi

WORKERS=${BUGSTORE_WORKERS:-4}
TIMEOUT=${BUGSTORE_TIMEOUT:-30}

if [ "${BUGSTORE_WAF_ENABLED:-false}" = "true" ]; then
    echo "🛡️ WAF + Rate Limit enabled — starting Caddy with Coraza WAF..."
    CADDY_CONFIG="/app/Caddyfile.waf"
else
    echo "🔓 WAF disabled — starting Caddy as HTTPS reverse proxy only..."
    CADDY_CONFIG="/app/Caddyfile"
fi

echo "🌐 Caddy config: $CADDY_CONFIG (${WORKERS} workers, ${TIMEOUT}s timeout)"
caddy start --config "$CADDY_CONFIG" --adapter caddyfile
cd /app && python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers "$WORKERS" --timeout-keep-alive "$TIMEOUT"
