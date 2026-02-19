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
  <strong>An insect-themed e-commerce app with 32 security vulnerabilities hidden inside.</strong><br/>
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
docker compose up -d
```

Open `http://localhost:80` and start hunting. MariaDB + FastAPI + Caddy WAF all start automatically.

## What's Inside

```
Frontend:  React + Vite + Tailwind (dark "hive" theme)
Backend:   FastAPI + SQLAlchemy + MariaDB
API:       REST + GraphQL
Auth:      JWT tokens
WAF:       Caddy + Coraza (OWASP CRS)
Docker:    Multi-stage build + docker-compose
```

**The Store:**
- Product catalog with search and filters
- Shopping cart and checkout
- User registration, login, profiles
- Blog ("Chronicles") and forum ("The Buzz")
- Product reviews
- Admin dashboard with user/product management
- Secure Portal with TOTP/2FA authentication
- Scoring dashboard to track your progress

**The Vulns (32 total):**

| Tier | Difficulty | Points | Examples |
|------|-----------|--------|----------|
| Tier 1 | Easy | 1 pt | SQL Injection, Reflected XSS, IDOR, Open Redirect, Path Traversal |
| Tier 2 | Medium | 2 pts | Blind SQLi, Stored XSS, SSRF, JWT issues, GraphQL info disclosure, TOTP brute force |
| Tier 3 | Hard | 3 pts | Remote Code Execution, SSTI, Insecure Deserialization |

The full list with PoCs is at `/api/debug/vulns` (Level 0 only) or on the Scoreboard page.

## Default Credentials

| Role | Username | Email | Password |
|------|----------|-------|----------|
| Admin | admin | admin@bugstore.com | admin123 |
| Staff | staff | staff@bugstore.com | staff123 |
| User | user | user@bugstore.com | user123 |
| User | hacker_pro | hacker@darkweb.com | 123456 |
| Admin (2FA) | admin2fa | admin2fa@bugstore.com | admin2fa123 |

## Configuration

| Variable | Default | What it does |
|----------|---------|-------------|
| `BUGSTORE_DIFFICULTY` | `0` | `0` = easy mode, `1` = filtered, `2` = WAF active |
| `BUGSTORE_AUTO_SEED` | `true` | Seed DB with test data on first run |
| `BUGSTORE_SCORING_ENABLED` | `true` | Show/hide the scoring dashboard |
| `BUGSTORE_WAF_ENABLED` | `true` | Enable Caddy reverse proxy with Coraza WAF |
| `BUGSTORE_WORKERS` | `4` | Number of uvicorn workers |
| `BUGSTORE_REQUEST_TIMEOUT` | `10` | Max request duration in seconds |
| `DATABASE_URL` | `mysql+pymysql://...` | MariaDB connection string |

### Difficulty Levels

- **Level 0** — No protections. Verbose errors. All vulns wide open. Scoreboard available.
- **Level 1** — Basic input filtering. Generic error messages. Rate limiting (100 req/min).
- **Level 2** — WAF active. Strict CSP + HSTS. Rate limiting (30 req/min). Good luck.

## Local Development (without Docker)

```bash
# Start MariaDB (or use SQLite for quick local dev)
export DATABASE_URL="sqlite:///./bugstore.db"

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
For local dev, SQLite still works. Production uses MariaDB via docker-compose.

## Use It With BugTraceAI

BugStore was built as a target for [**BugTraceAI**](https://bugtraceai.com). Point it at your local instance and see how many of the 32 vulnerabilities it catches automatically:

```bash
# Start BugStore
docker compose up -d

# Scan with BugTraceAI
bugtrace scan http://localhost:80
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
      secure_portal.py   # V-031, V-032 (TOTP/2FA)
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

New to BugStore? Follow our hint-based walkthrough to find all 26 active vulnerabilities. No full solutions — just progressive hints to help you learn by doing.

- **[English Walkthrough](WALKTHROUGH_EN.md)**
- **[Guia en Espanol](WALKTHROUGH_ES.md)**

## Security Notice

This app is **intentionally vulnerable**. It contains:

- Remote Code Execution (RCE)
- SQL Injection (multiple variants)
- Cross-Site Scripting (reflected + stored)
- Insecure Deserialization
- Authentication bypass
- And 27 more...

**Never** run this on a machine with sensitive data. Use a VM or container. You've been warned.

## Contributors

Thanks to these people for making BugStore better:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Acorzo1983">
        <img src="https://avatars.githubusercontent.com/u/92622147?v=4" width="80" style="border-radius:50%" alt="Albert"/><br/>
        <sub><b>Albert</b></sub>
      </a><br/>
      <sub>Creator & Maintainer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Neorichi">
        <img src="https://avatars.githubusercontent.com/u/3147619?v=4" width="80" style="border-radius:50%" alt="RSanchez"/><br/>
        <sub><b>RSanchez</b></sub>
      </a><br/>
      <sub>Security (V-031, V-032)</sub>
    </td>
  </tr>
</table>

## Contributing

Found a bug in the bugs? PRs welcome. If you want to add a new vulnerability, open an issue first describing the attack vector and difficulty tier.

## License

MIT — do whatever you want, just don't blame us when your localhost gets pwned.

---

<p align="center">
  <strong>Built with love and deliberate negligence by <a href="https://bugtraceai.com">BugTraceAI</a></strong><br/>
  <sub>All bugs reserved.</sub>
</p>
