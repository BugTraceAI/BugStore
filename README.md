<p align="center">
  <img src="logo.png" alt="BugTraceAI" width="120" />
</p>

<h1 align="center">BugStore</h1>
<h3 align="center">The Hive — A Deliberately Vulnerable Playground</h3>

<p align="center">
  <a href="https://bugtraceai.com"><img src="https://img.shields.io/badge/by-BugTraceAI-FF6B47?style=for-the-badge" alt="BugTraceAI" /></a>
  <img src="https://img.shields.io/badge/vulns-32-red?style=for-the-badge" alt="32 Vulnerabilities" />
  <img src="https://img.shields.io/badge/docker-ready-blue?style=for-the-badge&logo=docker" alt="Docker Ready" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  <strong>An insect-themed e-commerce app with 30 security vulnerabilities hidden inside.</strong><br/>
  Break it. Scan it. Learn from it.
</p>

---

## What is this?

BugStore is a full-featured online shop where you can "adopt" exotic bugs — beetles, mantises, spiders, and ants. It looks real. It works like a real store. But under the hood, it's riddled with **32 deliberately planted security vulnerabilities** spanning the OWASP Top 10 and beyond.

It's the official playground of [**BugTraceAI**](https://bugtraceai.com) — built so you can point your scanners, tools, or bare hands at a real-looking target and practice finding bugs in bugs.

> **DO NOT** deploy this to production, expose it to the internet, or enter real credentials. Seriously. It has RCE.

## Quick Start

**You only need Docker.**

```bash
git clone https://github.com/BugTraceAI/BugStore.git
cd BugStore
docker build -t bugstore .
docker run -p 8080:8080 -e BUGSTORE_AUTO_SEED=true bugstore
```

Open `http://localhost:8080` and start hunting.

## What's Inside

```
Frontend:  React + Vite + Tailwind (dark "hive" theme)
Backend:   FastAPI + SQLAlchemy + SQLite
API:       REST + GraphQL
Auth:      JWT tokens
Docker:    Multi-stage build, single container
```

**The Store:**
- Product catalog with search and filters
- Shopping cart and checkout
- User registration, login, profiles
- Blog ("Chronicles") and forum ("The Buzz")
- Product reviews
- Admin dashboard with user/product management
- Scoring dashboard to track your progress
- **Secure Portal** with TOTP/2FA authentication

## Secure Portal (2FA)

BugStore includes a secondary admin portal at `/secure-portal` that requires TOTP-based two-factor authentication. This coexists with the standard `/admin` (no 2FA) for testing both authentication flows.

### Setting Up 2FA

1. Login normally at `/login` with admin credentials
2. Navigate to `/secure-portal/setup`
3. Scan the QR code with Google Authenticator, Authy, or similar
4. Enter the 6-digit code to enable 2FA

### Using the Secure Portal

```bash
# 1. Login normally to get a basic token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Setup TOTP (requires basic token)
curl -X POST http://localhost:8080/api/secure-portal/setup-totp \
  -H "Authorization: Bearer <token>"

# 3. Enable TOTP with code from authenticator app
curl -X POST http://localhost:8080/api/secure-portal/enable-totp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"totp_code":"123456"}'

# 4. Login to secure portal with 2FA
curl -X POST http://localhost:8080/api/secure-portal/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","totp_code":"123456"}'
```

### Programmatic TOTP Generation

```python
import pyotp
import requests

# After setup, use the secret to generate codes
totp = pyotp.TOTP("YOUR_TOTP_SECRET")
code = totp.now()  # Valid for 30 seconds

# Login with generated code
requests.post("http://localhost:8080/api/secure-portal/login", json={
    "username": "admin",
    "password": "admin123",
    "totp_code": code
})
```

### 2FA Vulnerabilities

| ID | Vulnerability | Description |
|----|---------------|-------------|
| V-030 | TOTP Brute Force | No rate limiting on `/api/secure-portal/login` |
| V-031 | Secret Disclosure | `totp_secret` exposed in login response |

**The Vulns (32 total):**

| Tier | Difficulty | Points | Examples |
|------|-----------|--------|----------|
| Tier 1 | Easy | 1 pt | SQL Injection, Reflected XSS, IDOR, Open Redirect, Path Traversal |
| Tier 2 | Medium | 2 pts | Blind SQLi, Stored XSS, SSRF, JWT issues, GraphQL info disclosure |
| Tier 3 | Hard | 3 pts | Remote Code Execution, SSTI, Insecure Deserialization |

The full list with PoCs is at `/api/debug/vulns` (Level 0 only) or on the Scoreboard page.

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Staff | carlos | staff2024 |
| User | john_doe | password123 |
| User | jane_mantis | ilovemantis |

### 2FA Pre-configured User

For testing the Secure Portal without manual setup:

| Field | Value |
|-------|-------|
| Username | `admin2fa` |
| Password | `admin2fa123` |
| TOTP Secret | `JBSWY3DPEHPK3PXP` |

Generate TOTP code:
```bash
python3 -c "import pyotp; print(pyotp.TOTP('JBSWY3DPEHPK3PXP').now())"
```

Quick login test:
```bash
CODE=$(python3 -c "import pyotp; print(pyotp.TOTP('JBSWY3DPEHPK3PXP').now())")
curl -X POST http://localhost:8080/api/secure-portal/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin2fa\",\"password\":\"admin2fa123\",\"totp_code\":\"$CODE\"}"
```

## Configuration

| Variable | Default | What it does |
|----------|---------|-------------|
| `BUGSTORE_DIFFICULTY` | `0` | `0` = easy mode, `1` = filtered, `2` = WAF active |
| `BUGSTORE_AUTO_SEED` | `false` | Seed DB with test data on first run |
| `BUGSTORE_SCORING_ENABLED` | `true` | Show/hide the scoring dashboard |
| `BUGSTORE_WAF_ENABLED` | `false` | Enable Caddy reverse proxy with WAF |
| `PORT` | `8080` | Server port |

### Difficulty Levels

- **Level 0** — No protections. Verbose errors. All vulns wide open. Scoreboard available.
- **Level 1** — Basic input filtering. Generic error messages. Rate limiting (100 req/min).
- **Level 2** — WAF active. Strict CSP + HSTS. Rate limiting (30 req/min). Good luck.

## Local Development (without Docker)

```bash
# Backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 init_db.py
python3 seed.py
python3 src/main.py

# Frontend (separate terminal)
cd src/frontend
npm install
npm run dev
```

Backend at `:8080`, frontend at `:5173` (proxies API calls to backend).

## Use It With BugTraceAI

BugStore was built as a target for [**BugTraceAI**](https://bugtraceai.com). Point it at your local instance and see how many of the 30 vulnerabilities it catches automatically:

```bash
# Start BugStore
docker run -p 8080:8080 -e BUGSTORE_AUTO_SEED=true bugstore

# Scan with BugTraceAI
bugtrace scan http://localhost:8080
```

Compare the automated results against the Scoreboard to see what was found and what was missed.

## Project Structure

```
BugStore/
  src/
    main.py              # FastAPI app + SPA routing
    models.py            # SQLAlchemy models (12 tables)
    routes/              # API endpoints (each with planted vulns)
      catalog.py         # V-001, V-012, V-014
      auth.py            # V-009, V-010
      forum.py           # V-003, V-004
      admin.py           # V-005, V-006, V-007
      health.py          # V-021 (RCE!)
      ...
    frontend/
      src/pages/         # React pages
      tailwind.config.js # "Hive" theme
  static/images/         # 3D cartoon bug images
  seed.py                # Test data seeder
  Dockerfile             # Multi-stage build
  fly.toml               # Fly.io deployment config
```

## Walkthrough Guide

New to BugStore? Follow our hint-based walkthrough to find all 24 active vulnerabilities. No full solutions — just progressive hints to help you learn by doing.

- **[English Walkthrough](WALKTHROUGH_EN.md)**
- **[Guia en Espanol](WALKTHROUGH_ES.md)**

## Security Notice

This app is **intentionally vulnerable**. It contains:

- Remote Code Execution (RCE)
- SQL Injection (multiple variants)
- Cross-Site Scripting (reflected + stored)
- Insecure Deserialization
- Authentication bypass
- And 25 more...

**Never** run this on a machine with sensitive data. Use a VM or container. You've been warned.

## Contributing

Found a bug in the bugs? PRs welcome. If you want to add a new vulnerability, open an issue first describing the attack vector and difficulty tier.

## License

MIT — do whatever you want, just don't blame us when your localhost gets pwned.

---

<p align="center">
  <strong>Built with love and deliberate negligence by <a href="https://bugtraceai.com">BugTraceAI</a></strong><br/>
  <sub>All bugs reserved.</sub>
</p>
