# 🐛 BugStore

**A Deliberately Vulnerable E-Commerce Application for Security Testing**

BugStore is an intentionally insecure web application designed for security researchers, penetration testers, and students to practice identifying and exploiting web vulnerabilities in a safe, legal environment.

> ⚠️ **WARNING**: This application contains **30 deliberately planted security vulnerabilities**. **NEVER** deploy this in a production environment or expose it to the public internet.

## 🎯 Features

- **Full E-Commerce Platform**: Product catalog, shopping cart, checkout, user accounts
- **Community Features**: Blog, forum ("The Swarm"), product reviews
- **Admin Dashboard**: User management, product CRUD, email templates, system health
- **30 Vulnerabilities**: Spanning OWASP Top 10 and beyond
- **3 Difficulty Levels**: Adjustable exploitation difficulty via environment variables
- **GraphQL API**: Additional attack surface with information disclosure
- **WAF Integration**: Optional Caddy + Coraza WAF for Level 2

## 🐞 Vulnerability Categories

BugStore contains vulnerabilities across multiple tiers:

- **Tier 1 (Easy)**: SQL Injection, XSS, IDOR, Path Traversal, Open Redirect
- **Tier 2 (Medium)**: Blind SQLi, SSRF, XXE, GraphQL issues, JWT weaknesses
- **Tier 3 (Hard)**: RCE, SSTI, Insecure Deserialization

Full vulnerability list available at `/api/debug/vulns` (Level 0 only).

## 🚀 Quick Start

### Prerequisites

- **Docker** (recommended) OR
- **Python 3.11+** and **Node.js 20+**
- **SQLite** (included with Python)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/bugstore.git
cd bugstore

# Build and run
docker build -t bugstore .
docker run -p 8080:8080 -e BUGSTORE_DIFFICULTY=0 bugstore
```

Visit `http://localhost:8080`

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/bugstore.git
cd bugstore

# Backend setup
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Initialize database
python3 init_db.py

# Seed with test data
python3 seed.py

# Run backend
python3 src/main.py

# Frontend setup (in a new terminal)
cd src/frontend
npm install
npm run dev
```

Backend: `http://localhost:8080`  
Frontend: `http://localhost:5173`

## 🎮 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bugstore.local | admin123 |
| Staff | carlos@bugstore.local | staff2024 |
| User | john@bugstore.local | password123 |
| User | jane@bugstore.local | ilovemantis |

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8080 | Application port |
| `DATABASE_URL` | `sqlite:///./bugstore.db` | Database connection string |
| `BUGSTORE_DIFFICULTY` | 0 | Difficulty level (0, 1, 2) |
| `BUGSTORE_WAF_ENABLED` | false | Enable Caddy WAF (Level 2) |
| `BUGSTORE_AUTO_SEED` | false | Auto-seed DB on first run |

### Difficulty Levels

- **Level 0**: No protections, verbose errors, all vulnerabilities easily exploitable
- **Level 1**: Basic input filtering, generic errors, rate limiting (100 req/min)
- **Level 2**: WAF active, strict CSP, HSTS, rate limiting (30 req/min)

## 📚 Documentation

- [SETUP.md](SETUP.md) - Detailed installation and configuration
- [VULNS.md](VULNS.md) - Complete vulnerability reference (⚠️ SPOILERS)
- [BENCHMARK-GUIDE.md](BENCHMARK-GUIDE.md) - Scanner benchmarking instructions

## 🎯 Use Cases

- **Security Training**: Learn to identify and exploit common web vulnerabilities
- **Tool Testing**: Benchmark security scanners and tools
- **CTF Practice**: Sharpen your penetration testing skills
- **Research**: Study vulnerability patterns in a controlled environment

## 🛡️ Security Notice

This application is **intentionally vulnerable**. Key risks include:

- Remote Code Execution (RCE)
- SQL Injection leading to full database compromise
- Cross-Site Scripting (XSS) in multiple locations
- Authentication bypass vulnerabilities
- Insecure deserialization

**DO NOT**:
- Deploy to production
- Expose to the internet
- Use real credentials or data
- Run on systems with sensitive information

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Test your changes
4. Submit a pull request

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Inspired by:
- OWASP WebGoat
- Damn Vulnerable Web Application (DVWA)
- Juice Shop

---

**Remember**: This is a learning tool. Use responsibly and ethically. Happy bug hunting! 🐛🔍
