# BugStore Setup Guide

Complete installation and configuration instructions for BugStore.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Methods](#installation-methods)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements

- **OS**: Linux, macOS, or Windows 10+
- **RAM**: 2GB minimum, 4GB recommended
- **Disk**: 500MB free space
- **Network**: Internet connection for initial setup

### Software Dependencies

#### Docker Method (Recommended)
- Docker 20.10+
- Docker Compose 2.0+ (optional)

#### Local Development Method
- Python 3.11 or higher
- Node.js 20.x or higher
- npm 9.x or higher
- SQLite 3.x (usually included with Python)

## Installation Methods

### Method 1: Docker (Recommended)

This is the easiest method and ensures consistent behavior across platforms.

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/bugstore.git
cd bugstore

# 2. Build the Docker image
docker build -t bugstore:latest .

# 3. Run the container
docker run -d \
  --name bugstore \
  -p 8080:8080 \
  -e BUGSTORE_DIFFICULTY=0 \
  -v bugstore-data:/data \
  bugstore:latest

# 4. Check logs
docker logs -f bugstore
```

Visit `http://localhost:8080`

### Method 2: Local Development

For development or when Docker is not available.

#### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/bugstore.git
cd bugstore
```

#### Step 2: Backend Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Step 3: Frontend Setup

```bash
cd src/frontend

# Install Node dependencies
npm install

# Build frontend (production)
npm run build

# OR run development server
npm run dev

cd ../..
```

#### Step 4: Database Initialization

```bash
# Initialize database schema
python3 init_db.py

# Seed with test data
python3 seed.py
```

#### Step 5: Run Application

```bash
# Run backend server
python3 src/main.py
```

The API will be available at `http://localhost:8080`

If running frontend in dev mode, it will be at `http://localhost:5173`

## Database Setup

### SQLite (Default)

BugStore uses SQLite by default, which requires no additional setup.

```bash
# Database file location
./bugstore.db  # Local development
/data/bugstore.db  # Docker container
```

### PostgreSQL (Production)

For production-like testing with PostgreSQL:

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@localhost:5432/bugstore"

# Initialize database
python3 init_db.py

# Seed data
python3 seed.py
```

### Resetting the Database

```bash
# Delete database file
rm bugstore.db  # or /data/bugstore.db in Docker

# Reinitialize
python3 init_db.py
python3 seed.py
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Server Configuration
PORT=8080

# Database
DATABASE_URL=sqlite:///./bugstore.db

# Difficulty Level (0, 1, or 2)
BUGSTORE_DIFFICULTY=0

# WAF Configuration (Level 2 only)
BUGSTORE_WAF_ENABLED=false
BUGSTORE_WAF_PARANOIA=1

# Auto-seed on first run
BUGSTORE_AUTO_SEED=true
```

### Difficulty Levels Explained

#### Level 0: Maximum Vulnerability
- No input filtering
- Verbose error messages with stack traces
- No rate limiting
- All vulnerabilities easily exploitable
- Debug endpoints enabled (`/api/debug/vulns`)

**Use for**: Initial learning, tool testing

#### Level 1: Basic Protections
- Character blacklist (`<`, `>`, `'`, `"`, `;`) in some parameters
- Generic error messages
- Rate limiting: 100 requests/minute
- Partial security headers (X-Frame-Options)
- Debug endpoints disabled

**Use for**: Intermediate practice, bypass techniques

#### Level 2: Hardened (But Still Vulnerable)
- Caddy WAF with OWASP CRS active
- Strict Content Security Policy
- HSTS enabled
- Rate limiting: 30 requests/minute
- Server and client-side validation
- All vulnerabilities still present but harder to exploit

**Use for**: Advanced practice, realistic scenarios

### WAF Configuration (Level 2)

When `BUGSTORE_WAF_ENABLED=true`:

```bash
# Caddyfile is automatically configured
# Adjust paranoia level (1-4)
export BUGSTORE_WAF_PARANOIA=2
```

## Running the Application

### Development Mode

```bash
# Terminal 1: Backend
source venv/bin/activate
python3 src/main.py

# Terminal 2: Frontend (optional)
cd src/frontend
npm run dev
```

### Production Mode (Docker)

```bash
docker-compose up -d
```

### Using fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch app
flyctl launch

# Deploy
flyctl deploy

# Set secrets
flyctl secrets set BUGSTORE_DIFFICULTY=0
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080  # Linux/macOS
netstat -ano | findstr :8080  # Windows

# Kill the process or change PORT
export PORT=8081
```

#### Database Locked Error

```bash
# SQLite is locked by another process
# Close all connections and restart
rm bugstore.db
python3 init_db.py
python3 seed.py
```

#### Frontend Build Fails

```bash
# Clear npm cache
cd src/frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Python Dependencies Error

```bash
# Ensure Python 3.11+
python3 --version

# Upgrade pip
pip install --upgrade pip

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

#### Docker Build Fails

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t bugstore:latest .
```

### Getting Help

1. Check the [FAQ](FAQ.md)
2. Review [VULNS.md](VULNS.md) for vulnerability-specific issues
3. Open an issue on GitHub
4. Join our community Discord (link in README)

## Next Steps

- Read [VULNS.md](VULNS.md) for vulnerability details (contains spoilers!)
- Try [BENCHMARK-GUIDE.md](BENCHMARK-GUIDE.md) to test security scanners
- Explore the application at `http://localhost:8080`
- Check `/api/debug/vulns` (Level 0 only) for vulnerability hints

---

**Security Reminder**: This application is intentionally vulnerable. Never expose it to the internet or use it with real data.
