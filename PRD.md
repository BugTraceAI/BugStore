# BugStore - Product Requirements Document

## Deliberately Vulnerable Web Application for Security Scanner Benchmarking

**Version:** 1.0
**Date:** 2026-02-13
**Author:** BugTraceAI Team
**Status:** Draft

---

## 1. Vision

BugStore es una tienda online deliberadamente vulnerable donde se venden "bugs" (insectos) como mascotas. La temática es divertida y accesible: los insectos se presentan como si fueran perritos o gatitos adoptables, con nombres, personalidades, fotos adorables y perfiles de adopción.

El objetivo real es servir como **campo de pruebas de benchmarking** que demuestre las capacidades de detección de BugTraceAI frente a escáneres tradicionales como Burp Suite.

### Diferencia con Juice Shop

| Aspecto | OWASP Juice Shop | BugStore |
|---------|-----------------|----------|
| Propósito | Formación general en seguridad | Benchmarking de escáneres |
| Vulnerabilidades | Genéricas, OWASP Top 10 | Diseñadas para exponer gaps de escáneres tradicionales |
| Detección | Cualquier escáner encuentra la mayoría | Requiere análisis profundo (AI, OOB, chains) |
| Temática | Tienda de zumos | Tienda de insectos-mascota |
| Complejidad | Vulnerabilidades aisladas | Cadenas de explotación multi-paso |
| WAF | Sin WAF | WAF configurable para test de evasión |

---

## 2. Concepto y Temática

### La Tienda

**BugStore** - "Adopt a Bug, Love a Bug"

- Catálogo de insectos como mascotas: escarabajos, mariposas, mantis religiosas, mariquitas, grillos, hormigas reina, luciérnagas, etc.
- Cada "mascota" tiene un perfil completo: nombre, especie, personalidad, nivel de cuidado, precio, foto adorable
- Los usuarios pueden adoptar (comprar), dejar reseñas, subir fotos de sus mascotas
- Blog con artículos sobre cuidado de insectos
- Foro comunitario
- Panel de administración

### Nombres y Branding

- **Nombre**: BugStore
- **Eslogan**: "Adopt a Bug, Love a Bug"
- **Mascota**: "Debuggy" - una mariquita con ojos grandes y sonrisa
- **Secciones principales**:
  - The Hive (catálogo)
  - Bug Nursery (nuevas llegadas)
  - My Colony (perfil de usuario)
  - Bug Blog (artículos)
  - The Swarm (foro)
  - Nest Admin (panel admin)

---

## 3. Análisis Competitivo: Burp Suite vs BugTraceAI

### Lo que Burp Suite encontró en ginandjuice.shop (52 issues)

| Categoría | Hallazgos |
|-----------|-----------|
| SQL Injection | 2 instancias (category param, TrackingId cookie) |
| XSS Reflected | 1 instancia |
| XSS DOM-based | 1 instancia |
| Client-Side Template Injection | 2 instancias (Angular) |
| HTTP Header Injection | 1 instancia |
| Open Redirect DOM-based | 2 instancias |
| Prototype Pollution | 2 instancias |
| External Service Interaction | 6 instancias (HTTP + DNS) |
| Security Misconfiguration | 20+ (cookies, headers, HSTS, cache) |

### Lo que Burp Suite NO detecta (o detecta mal)

Basado en el análisis del reporte y la arquitectura de BugTraceAI:

| Vulnerabilidad | Por qué Burp falla | Cómo BugTraceAI lo detecta |
|----------------|---------------------|----------------------------|
| **IDOR** | No comprende lógica de negocio | IDORAgent: manipulación de IDs en paths y params |
| **JWT Algorithm Confusion** | No analiza tokens JWT en profundidad | JWTAgent: none algorithm, brute-force de secrets |
| **LFI/Path Traversal** | Detección limitada a patterns básicos | LFIAgent: evasión de filtros, descubrimiento autónomo de params |
| **SSRF** | No puede verificar OOB callbacks | SSRFAgent + Interactsh: verificación OOB real |
| **XXE** | Limitado a XML obvio | XXEAgent: DTD injection, OOB exfiltración |
| **File Upload RCE** | No sube archivos activamente | FileUploadAgent: bypass de MIME, polyglots |
| **Mass Assignment** | No comprende modelos de datos | APISecurityAgent: pruebas de asignación masiva |
| **Blind SQLi OOB** | Solo Burp Collaborator (no open-source) | Interactsh + SQLMap: DNS exfiltración gratuita |
| **Exploitation Chains** | Reporta vulns aisladas | ChainDiscoveryAgent: modela grafos de explotación |
| **Second-Order SQLi** | No rastrea datos almacenados | SQLiAgent: tracking multi-paso |
| **RCE via Deserialization** | Pattern matching básico | RCEAgent: detección activa de deserialización |
| **GraphQL Injection** | Soporte GraphQL limitado | APISecurityAgent: introspección + injection |
| **WAF Bypass** | Tamper scripts manuales | Q-Learning WAF Strategy Router: auto-adaptación |
| **Business Logic Flaws** | No comprende flujos de negocio | DASTySAST: 6 personas AI analizan lógica |

---

## 4. Arquitectura Técnica

### Principio: Single Pod, Todo Configurable

BugStore corre en **un solo contenedor** (single pod) desplegable en fly.io, Railway, Render, o cualquier PaaS. No hay Docker Compose con múltiples servicios — un solo Dockerfile, un solo proceso principal, todo configurable via env vars.

### Stack

```
Frontend:   React 18 + TypeScript + Tailwind CSS (build estático servido por backend)
Backend:    Python 3.11 + FastAPI + Uvicorn
Database:   PostgreSQL (fly.io Postgres) | SQLite (local/dev) — configurable
Sessions:   JWT stateless (no Redis necesario)
Auth:       JWT (deliberadamente débil)
API:        REST + GraphQL (dual)
WAF:        Caddy con coraza-waf plugin (mismo container, reverse proxy)
Container:  Single Dockerfile multi-stage
Deploy:     fly.io (primary), Docker local (dev)
```

### Arquitectura del Pod

```
┌─────────────────────────────────────────────┐
│                 fly.io Machine               │
│                                              │
│  ┌─────────────┐     ┌──────────────────┐   │
│  │   Caddy      │────▶│   FastAPI         │   │
│  │  (port 443)  │     │  (port 8080)      │   │
│  │  + coraza    │     │                    │   │
│  │    WAF       │     │  /api/*  → API     │   │
│  │  (Level 2)   │     │  /*      → static  │   │
│  └─────────────┘     │  /uploads → files   │   │
│         │             └────────┬───────────┘   │
│         │                      │               │
│  Level 0/1:                    ▼               │
│  Caddy bypassed        ┌──────────────┐       │
│  FastAPI directo        │  PostgreSQL   │       │
│  en port 8080           │  (fly.io)     │       │
│                         │  o SQLite     │       │
│                         │  (local file) │       │
│                         └──────────────┘       │
│                                                │
│  Volume: /data (SQLite DB + uploads + logs)    │
└────────────────────────────────────────────────┘
```

### Base de Datos

La DB es totalmente configurable via `DATABASE_URL`:

| Entorno | DB | Config |
|---------|-----|--------|
| **fly.io** | Fly Postgres (managed) | `DATABASE_URL=postgres://user:pass@bugstore-db.flycast:5432/bugstore` |
| **Local dev** | SQLite | `DATABASE_URL=sqlite:///data/bugstore.db` |
| **Docker local** | PostgreSQL | `DATABASE_URL=postgres://bugstore:bugstore@localhost:5432/bugstore` |
| **Testing** | SQLite in-memory | `DATABASE_URL=sqlite:///:memory:` |

El backend usa SQLAlchemy con ambos dialectos. Las queries vulnerables usan `text()` raw SQL (deliberado), las queries normales usan ORM parameterizado.

### Estructura del Proyecto

```
bugstore/
├── Dockerfile                       # Multi-stage: build frontend + run backend
├── fly.toml                         # Config fly.io
├── Caddyfile                        # Reverse proxy + WAF (Level 2)
├── Procfile                         # Procesos: web, caddy (opcional)
├── backend/
│   ├── main.py                      # FastAPI app entry point
│   ├── config.py                    # Settings from env vars
│   ├── database.py                  # SQLAlchemy engine (postgres/sqlite)
│   ├── models/                      # SQLAlchemy models
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── review.py
│   │   ├── blog.py
│   │   ├── forum.py
│   │   └── coupon.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── catalog.py
│   │   ├── cart.py
│   │   ├── orders.py
│   │   ├── reviews.py
│   │   ├── blog.py
│   │   ├── forum.py
│   │   ├── admin.py
│   │   ├── graphql.py
│   │   └── debug.py                 # Vuln verification (Level 0 only)
│   ├── middleware/
│   │   ├── difficulty.py            # Level 0/1/2 filter logic
│   │   ├── auth.py                  # JWT decode (deliberately weak)
│   │   ├── tracking.py              # TrackingId cookie → SQL (V-013)
│   │   └── rate_limit.py            # Per-IP rate limiting
│   ├── services/
│   │   ├── seed.py                  # DB seeding on first run
│   │   └── scoring.py               # Benchmark scoring engine
│   └── templates/                   # Jinja2 (for SSTI V-027)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Catalog.tsx          # The Hive
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Blog.tsx
│   │   │   ├── BlogPost.tsx
│   │   │   ├── Forum.tsx
│   │   │   ├── Profile.tsx          # My Colony
│   │   │   ├── Admin.tsx            # Nest Admin
│   │   │   ├── Login.tsx
│   │   │   └── Benchmark.tsx        # Scoring dashboard
│   │   ├── components/
│   │   └── utils/
│   ├── public/
│   │   ├── js/
│   │   │   ├── angular_1-7-7.js     # Legacy vulnerable (V-004, V-030)
│   │   │   ├── jquery-2.1.4.js      # Vulnerable dep (V-030)
│   │   │   ├── lodash-4.17.15.js    # Vulnerable dep (V-030)
│   │   │   ├── scanme.js
│   │   │   └── subscribeNow.js
│   │   └── images/
│   └── package.json
├── data/
│   ├── products.json                # Catálogo de bugs
│   ├── users.json                   # Usuarios seed
│   ├── blog_posts.json              # Artículos seed
│   ├── orders.json                  # Pedidos seed
│   └── reviews.json                 # Reviews seed
└── docs/
    ├── VULNS.md
    ├── SCORING.md
    └── BENCHMARK-GUIDE.md
```

---

## 5. Catálogo de Vulnerabilidades

Las vulnerabilidades están organizadas en 3 tiers según la dificultad de detección:

### Tier 1 — Baseline (Burp y BugTraceAI deberían encontrarlas)

Estas son el "mínimo" que cualquier escáner competente debe detectar.

#### V-001: SQL Injection en Búsqueda de Productos
- **Ubicación**: `GET /api/catalog?search={input}&category={input}`
- **Tipo**: Error-based + Union-based
- **Parámetros**: `search`, `category`
- **Detalle**: Query construida con concatenación de strings directa
- **Ejemplo**: `/api/catalog?search=' UNION SELECT username,password FROM users--`

#### V-002: XSS Reflected en Búsqueda
- **Ubicación**: `GET /catalog?q={input}`
- **Tipo**: Reflected XSS
- **Detalle**: El término de búsqueda se refleja sin sanitizar en `<h2>Resultados para: {input}</h2>`

#### V-003: XSS DOM-based en Filtro de Categoría
- **Ubicación**: `/catalog#category={input}`
- **Tipo**: DOM-based XSS
- **Detalle**: Fragment hash se inyecta en DOM via `innerHTML`
- **Sink**: `document.getElementById('category-title').innerHTML`

#### V-004: Client-Side Template Injection (Angular)
- **Ubicación**: `GET /blog?search={input}`
- **Tipo**: CSTI en Angular 1.x (legacy blog)
- **Detalle**: Blog usa Angular 1.7.x, input se interpola en template
- **Ejemplo**: `/blog?search={{constructor.constructor('alert(1)')()}}`

#### V-005: HTTP Header Injection
- **Ubicación**: `GET /api/redirect?url={input}`
- **Tipo**: CRLF Injection en header Location
- **Detalle**: Valor de `url` se inserta directamente en `Location:` header

#### V-006: Open Redirect
- **Ubicación**: `GET /auth/callback?returnUrl={input}`
- **Tipo**: DOM-based Open Redirect
- **Detalle**: `returnUrl` se usa en `window.location = returnUrl` sin validación

#### V-007: Prototype Pollution
- **Ubicación**: `/catalog` (client-side JS)
- **Tipo**: Client-side Prototype Pollution
- **Detalle**: Función `deepMerge()` vulnerable en el sistema de filtros
- **Ejemplo**: `?__proto__[polluted]=true`

#### V-008: Security Misconfigurations
- Cookies sin `Secure`, `HttpOnly`, `SameSite`
- Sin HSTS header
- CORS demasiado permisivo
- Respuestas HTTPS cacheables con datos sensibles
- Verbose error messages (stack traces)
- Server version header expuesto

---

### Tier 2 — Advanced (BugTraceAI debería encontrar, Burp probablemente no)

Estas vulnerabilidades requieren análisis más profundo que el pattern-matching de escáneres tradicionales.

#### V-009: IDOR en Pedidos de Usuario
- **Ubicación**: `GET /api/orders/{orderId}`
- **Tipo**: Insecure Direct Object Reference
- **Detalle**: No verifica que el `orderId` pertenezca al usuario autenticado
- **Explotación**: Cambiar `/api/orders/42` a `/api/orders/1` para ver pedidos ajenos
- **Por qué Burp falla**: No comprende la relación usuario-recurso
- **BugTraceAI**: IDORAgent detecta IDs numéricos en paths y prueba secuencias

#### V-010: IDOR en Perfil de Usuario
- **Ubicación**: `GET /api/users/{userId}/profile`
- **Tipo**: IDOR con datos sensibles
- **Detalle**: Endpoint devuelve email, dirección, historial de compras
- **Variante**: También expuesto via `GET /api/users/{userId}/orders`

#### V-011: JWT Algorithm Confusion
- **Ubicación**: Header `Authorization: Bearer {token}`
- **Tipo**: JWT none algorithm + weak secret
- **Detalle**:
  - Backend acepta `"alg": "none"` (bypass total de firma)
  - Secret de firma es `bugstore_secret_2024` (brute-forceable)
  - No valida campo `iss` ni `aud`
- **Explotación**: Forjar JWT con `alg: none` para escalar a admin
- **Por qué Burp falla**: No analiza JWT profundamente
- **BugTraceAI**: JWTAgent prueba none algorithm y diccionario de secrets

#### V-012: Blind SQL Injection (Time-based)
- **Ubicación**: `GET /api/catalog/filter?price_min={input}`
- **Tipo**: Time-based Blind SQLi
- **Detalle**: No produce errores visibles, pero inyección en cláusula WHERE
- **Ejemplo**: `?price_min=1 AND SLEEP(5)--`
- **Por qué Burp falla**: Detección tentativa, a menudo falso negativo
- **BugTraceAI**: SQLiAgent con múltiples técnicas + SQLMap confirma

#### V-013: Blind SQL Injection (OOB/DNS)
- **Ubicación**: Cookie `TrackingId` (decodificada de Base64)
- **Tipo**: Out-of-Band SQL Injection
- **Detalle**: Cookie se decodifica e inserta en query. Sin output visible
- **Explotación**: `LOAD_FILE()` / `UTL_HTTP.REQUEST()` hacia servidor externo
- **Por qué Burp falla**: Requiere Burp Collaborator Pro ($$$)
- **BugTraceAI**: Interactsh (gratuito) para verificación OOB

#### V-014: LFI / Path Traversal
- **Ubicación**: `GET /api/products/{id}/image?file={filename}`
- **Tipo**: Local File Inclusion
- **Detalle**: `file` param se concatena con directorio base sin sanitizar
- **Ejemplo**: `?file=../../../etc/passwd`
- **Variante**: También en `GET /api/blog/posts/{slug}/attachment?name={input}`
- **Por qué Burp falla**: No descubre params dentro de formularios dinámicos
- **BugTraceAI**: LFIAgent descubre autónomamente params con extensiones de archivo

#### V-015: SSRF via Import de Productos
- **Ubicación**: `POST /api/admin/import/url`
- **Tipo**: Server-Side Request Forgery
- **Body**: `{"source_url": "http://attacker.com/products.json"}`
- **Detalle**: Admin puede importar productos desde URL externa. El backend hace `requests.get(url)` sin restricción
- **Explotación**: `{"source_url": "http://169.254.169.254/latest/meta-data/"}` (cloud metadata)
- **Por qué Burp falla**: No puede verificar callbacks OOB
- **BugTraceAI**: SSRFAgent + Interactsh verifica la conexión real

#### V-016: XXE via Import XML
- **Ubicación**: `POST /api/admin/import/xml`
- **Tipo**: XML External Entity Injection
- **Detalle**: Endpoint acepta catálogo de productos en XML. Parser permite DTDs
- **Payload**:
  ```xml
  <?xml version="1.0"?>
  <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
  <products><product><name>&xxe;</name></product></products>
  ```
- **Variante OOB**: DTD externo para exfiltración ciega
- **Por qué Burp falla**: No sube XML activamente a endpoints de importación
- **BugTraceAI**: XXEAgent detecta formularios de upload XML y prueba DTDs

#### V-017: File Upload - Web Shell
- **Ubicación**: `POST /api/reviews/{productId}/photos`
- **Tipo**: Unrestricted File Upload → RCE
- **Detalle**: Permite subir "fotos de tu mascota" en reseñas. Valida extensión en frontend pero no en backend
- **Explotación**: Subir `.php` / `.jsp` renombrado como `.jpg.php`
- **Variante**: Polyglot image/PHP
- **Por qué Burp falla**: No sube archivos activamente
- **BugTraceAI**: FileUploadAgent descubre file inputs y prueba bypass de MIME

#### V-018: Mass Assignment
- **Ubicación**: `PUT /api/users/{userId}`
- **Tipo**: Mass Assignment / Over-posting
- **Detalle**: Endpoint acepta cualquier campo en el body JSON, incluyendo `role`
- **Explotación**: `PUT /api/users/42 {"name": "hacker", "role": "admin"}`
- **Por qué Burp falla**: No comprende modelos de datos
- **BugTraceAI**: APISecurityAgent prueba campos extra (role, isAdmin, permissions)

#### V-019: Second-Order SQL Injection
- **Ubicación**: `POST /api/auth/register` → `GET /api/users/me`
- **Tipo**: Stored/Second-Order SQLi
- **Detalle**: Username malicioso se almacena sin sanitizar. Se inyecta cuando el perfil se renderiza server-side en un query diferente
- **Ejemplo**: Registrar con username `admin'--` → al consultar perfil, ejecuta query malformada
- **Por qué Burp falla**: No rastrea datos entre requests
- **BugTraceAI**: SQLiAgent tracking multi-request con heurísticas

#### V-020: GraphQL Injection
- **Ubicación**: `POST /api/graphql`
- **Tipo**: GraphQL Introspection + Injection
- **Detalle**:
  - Introspección habilitada (expone schema completo)
  - Query depth sin límite (DoS)
  - Mutation `updateUser` sin autorización
  - Nested query permite enumerar usuarios
- **Por qué Burp falla**: Soporte GraphQL limitado
- **BugTraceAI**: APISecurityAgent prueba introspección, injection y DoS

---

### Tier 3 — Expert (Requiere análisis AI o cadenas multi-paso)

Vulnerabilidades que solo un sistema con comprensión contextual puede detectar.

#### V-021: Exploitation Chain — SQLi → Auth Bypass → Privilege Escalation
- **Cadena**:
  1. SQLi en `/api/catalog?search=` extrae hash de password de admin
  2. Hash débil (MD5 sin salt) → password en texto claro
  3. Login como admin → acceso a `/api/admin/`
  4. Admin panel permite ejecutar "health checks" → RCE
- **Por qué Burp falla**: Reporta cada vuln aislada, no la cadena
- **BugTraceAI**: ChainDiscoveryAgent modela grafos de explotación con NetworkX

#### V-022: Exploitation Chain — SSRF → Cloud Metadata → S3 Access
- **Cadena**:
  1. SSRF via `/api/admin/import/url` → `http://169.254.169.254/`
  2. Extraer IAM role credentials
  3. Usar credentials para acceder a S3 bucket privado
- **Detalle**: Solo verificable en entorno cloud (AWS/GCP deployment)

#### V-023: Business Logic — Price Manipulation
- **Ubicación**: `POST /api/cart/checkout`
- **Tipo**: Business Logic Flaw
- **Detalle**: El precio final se calcula en frontend y se envía al backend. El backend no re-verifica contra la base de datos
- **Explotación**: Interceptar request y cambiar `"total": 0.01`
- **Por qué Burp falla**: No comprende lógica de negocio
- **BugTraceAI**: DASTySAST con persona "Bug Bounty Hunter" detecta trust boundaries

#### V-024: Business Logic — Coupon Stacking
- **Ubicación**: `POST /api/cart/apply-coupon`
- **Tipo**: Logic Flaw
- **Detalle**: Se pueden aplicar múltiples cupones al mismo carrito sin límite
- **Explotación**: Aplicar `WELCOME10` repetidamente para llegar a precio negativo

#### V-025: Race Condition — Double Spending
- **Ubicación**: `POST /api/cart/checkout`
- **Tipo**: TOCTOU Race Condition
- **Detalle**: Enviar checkout simultaneamente en 2 threads con el mismo saldo
- **Resultado**: Se completan ambas compras, saldo queda negativo

#### V-026: RCE via Deserialization
- **Ubicación**: Cookie `user_prefs` (serializada con pickle/yaml)
- **Tipo**: Insecure Deserialization → Remote Code Execution
- **Detalle**: Preferencias del usuario se serializan con `pickle.loads()` o `yaml.load()`
- **Explotación**: Crafted pickle payload en cookie
- **Por qué Burp falla**: Pattern matching no detecta deserialization sinks
- **BugTraceAI**: RCEAgent detecta patterns de serialización

#### V-027: Server-Side Template Injection (SSTI)
- **Ubicación**: `POST /api/admin/email-template/preview`
- **Tipo**: SSTI en Jinja2
- **Detalle**: Admin puede previsualizar email templates. El input se renderiza con Jinja2 sin sandbox
- **Ejemplo**: `{{config.__class__.__init__.__globals__['os'].popen('id').read()}}`
- **Diferencia con CSTI**: Esto es server-side (Jinja2), no client-side (Angular)
- **BugTraceAI**: CSTIAgent diferencia client-side vs server-side

#### V-028: Broken Access Control — Horizontal + Vertical
- **Ubicación**: Múltiples endpoints
- **Tipo**: Broken Access Control (OWASP A01:2021)
- **Detalle**:
  - `GET /api/admin/users` accesible con JWT de usuario normal (vertical)
  - `DELETE /api/reviews/{id}` no verifica owner (horizontal)
  - `PUT /api/orders/{id}/status` cambiar estado sin ser admin
- **BugTraceAI**: IDORAgent + APISecurityAgent prueban roles cruzados

#### V-029: Subdomain Takeover (Bonus)
- **Ubicación**: `blog.bugstore.local` → CNAME dangling
- **Tipo**: Subdomain Takeover
- **Detalle**: Subdominio apunta a servicio externo dado de baja
- **Solo detectectable con**: Reconocimiento de activos + DNS
- **BugTraceAI**: AssetDiscoveryAgent + NucleiAgent

#### V-030: Vulnerable JavaScript Dependencies
- **Ubicación**: Frontend
- **Tipo**: Known Vulnerable Components
- **Detalle**: Dependencias deliberadamente desactualizadas:
  - Angular 1.7.7 (prototype pollution, CSTI)
  - jQuery 2.1.4 (XSS via $.html())
  - Lodash 4.17.15 (prototype pollution)
- **BugTraceAI**: NucleiAgent detecta versiones + CVEs específicos

---

## 6. Difficulty Levels

BugStore soportará 3 niveles de dificultad configurables via variable de entorno:

### Level 0 — No Protection
- Sin filtros ni WAF
- Mensajes de error verbosos con stack traces
- Todas las vulnerabilidades expuestas directamente
- Útil para aprender y hacer pruebas iniciales

### Level 1 — Production-like
- Filtros de input básicos (blacklist de caracteres)
- Mensajes de error genéricos
- Rate limiting básico
- Headers de seguridad parciales
- Simula una app real con protección mínima

### Level 2 — Hardened (DEFAULT)
- WAF ModSecurity activado (OWASP CRS ruleset)
- CSP headers estrictos
- Rate limiting agresivo
- Validación input server-side + client-side
- **Este es el nivel por defecto**: simula un entorno realista donde BugTraceAI demuestra su Q-learning WAF bypass frente a escáneres que no pueden adaptarse

---

## 7. Sistema de Scoring

### Para Benchmarking de Escáneres

Cada vulnerabilidad tiene una puntuación basada en:

| Factor | Peso |
|--------|------|
| Severidad (CVSS) | 40% |
| Dificultad de detección | 30% |
| Confirmación (PoC vs Tentative) | 20% |
| Cadena de explotación identificada | 10% |

### Tabla de Puntuación

| ID | Vulnerabilidad | Severidad | Puntos | Tier |
|----|---------------|-----------|--------|------|
| V-001 | SQLi en búsqueda | Critical | 10 | 1 |
| V-002 | XSS Reflected | High | 8 | 1 |
| V-003 | XSS DOM-based | High | 8 | 1 |
| V-004 | CSTI Angular | High | 9 | 1 |
| V-005 | Header Injection | Medium | 6 | 1 |
| V-006 | Open Redirect | Medium | 5 | 1 |
| V-007 | Prototype Pollution | Medium | 6 | 1 |
| V-008 | Misconfigurations | Low | 3 | 1 |
| V-009 | IDOR Pedidos | High | 12 | 2 |
| V-010 | IDOR Perfil | High | 12 | 2 |
| V-011 | JWT Algorithm | Critical | 15 | 2 |
| V-012 | Blind SQLi Time | High | 12 | 2 |
| V-013 | Blind SQLi OOB | Critical | 15 | 2 |
| V-014 | LFI/Path Traversal | High | 12 | 2 |
| V-015 | SSRF | Critical | 15 | 2 |
| V-016 | XXE | High | 13 | 2 |
| V-017 | File Upload RCE | Critical | 15 | 2 |
| V-018 | Mass Assignment | High | 12 | 2 |
| V-019 | Second-Order SQLi | High | 14 | 2 |
| V-020 | GraphQL Injection | High | 13 | 2 |
| V-021 | Chain: SQLi→Admin→RCE | Critical | 25 | 3 |
| V-022 | Chain: SSRF→Cloud | Critical | 20 | 3 |
| V-023 | Price Manipulation | High | 15 | 3 |
| V-024 | Coupon Stacking | Medium | 10 | 3 |
| V-025 | Race Condition | High | 15 | 3 |
| V-026 | Deserialization RCE | Critical | 18 | 3 |
| V-027 | SSTI Jinja2 | Critical | 16 | 3 |
| V-028 | Broken Access Control | High | 14 | 3 |
| V-029 | Subdomain Takeover | Medium | 10 | 3 |
| V-030 | Vulnerable Deps | Medium | 8 | 3 |

**Total posible: 370 puntos**

### Resultados Esperados

| Escáner | Tier 1 (55pts) | Tier 2 (148pts) | Tier 3 (151pts) | Total (370) | % |
|---------|:---:|:---:|:---:|:---:|:---:|
| Burp Suite Free | ~40 | ~15 | ~0 | ~55 | 15% |
| Burp Suite Pro | ~50 | ~40 | ~5 | ~95 | 26% |
| OWASP ZAP | ~35 | ~10 | ~0 | ~45 | 12% |
| Nuclei | ~20 | ~25 | ~5 | ~50 | 14% |
| **BugTraceAI** | **~55** | **~130** | **~100** | **~285** | **77%** |

---

## 8. Datos del Catálogo

### Productos (Bugs como Mascotas)

```
1.  "Debuggy" - Mariquita (Coccinellidae) - $29.99
    "La mascota perfecta para principiantes. Trae buena suerte y come pulgones."

2.  "Sir Mantis" - Mantis Religiosa - $49.99
    "Elegante, paciente, y un excelente cazador. El aristócrata de los insectos."

3.  "Sparkle" - Luciérnaga (Lampyridae) - $39.99
    "Ilumina tus noches con su brillo natural. Funciona sin pilas."

4.  "Atlas" - Escarabajo Atlas (Chalcosoma atlas) - $89.99
    "El forzudo del mundo insecto. Puede cargar 850x su peso."

5.  "Melody" - Grillo (Gryllidae) - $14.99
    "Serenatas nocturnas incluidas. Volumen no ajustable."

6.  "Cleopatra" - Mariposa Monarca (Danaus plexippus) - $59.99
    "Viajera del mundo. Necesita jardín grande y pasaporte."

7.  "Colonel" - Hormiga Reina (Formicidae) - $199.99
    "Viene con colonia inicial de 50 obreras. Kit de formicario incluido."

8.  "Pixel" - Escarabajo Joya (Chrysochroa) - $79.99
    "Más brillante que tu pantalla OLED. Colores iridiscentes reales."

9.  "Ninja" - Insecto Palo (Phasmatodea) - $34.99
    "Maestro del camuflaje. Puede que ya tengas uno sin saberlo."

10. "Buzz" - Abejorro (Bombus) - $44.99
    "Gordito, peludo y trabajador. El golden retriever de los insectos."

11. "Phantom" - Polilla Luna (Actias luna) - $69.99
    "Elegancia nocturna en verde esmeralda. Solo vive 7 días como adulto."

12. "Tank" - Escarabajo Rinoceronte (Dynastinae) - $99.99
    "Blindaje natural nivel 5. Ideal para quien quiere sentirse protegido."
```

### Usuarios Seed

```
Admin:    admin@bugstore.local / admin123 (MD5 sin salt: 0192023a7bbd73250516f069df18b500)
User:     john@bugstore.local / password123
User:     jane@bugstore.local / ilovemantis
Staff:    carlos@bugstore.local / staff2024
```

---

## 9. Endpoints API

### REST API

```
AUTH
  POST   /api/auth/register          — Registro (V-019: second-order SQLi)
  POST   /api/auth/login              — Login (devuelve JWT: V-011)
  POST   /api/auth/forgot-password    — Reset password
  GET    /api/auth/callback           — OAuth callback (V-006: open redirect)

CATALOG
  GET    /api/catalog                 — Listar productos (V-001: SQLi, V-007: proto pollution)
  GET    /api/catalog?search=         — Buscar (V-001, V-002: XSS)
  GET    /api/catalog/filter          — Filtro avanzado (V-012: blind SQLi)
  GET    /api/catalog/{id}            — Detalle producto
  GET    /api/catalog/{id}/image      — Imagen (V-014: LFI)

CART
  GET    /api/cart                    — Ver carrito
  POST   /api/cart/add                — Añadir producto
  POST   /api/cart/apply-coupon       — Aplicar cupón (V-024)
  POST   /api/cart/checkout           — Pagar (V-023: price manipulation, V-025: race)

ORDERS
  GET    /api/orders                  — Mis pedidos
  GET    /api/orders/{id}             — Detalle pedido (V-009: IDOR)

USERS
  GET    /api/users/{id}/profile      — Perfil público (V-010: IDOR)
  PUT    /api/users/{id}              — Actualizar perfil (V-018: mass assignment)
  GET    /api/users/me                — Mi perfil (V-019: second-order SQLi trigger)

REVIEWS
  GET    /api/reviews/{productId}     — Reseñas de producto
  POST   /api/reviews/{productId}     — Crear reseña
  POST   /api/reviews/{productId}/photos — Subir foto (V-017: file upload)
  DELETE /api/reviews/{id}            — Borrar reseña (V-028: broken access)

BLOG
  GET    /api/blog                    — Listar posts (V-004: CSTI)
  GET    /api/blog/{slug}             — Detalle post
  GET    /api/blog/{slug}/attachment  — Adjunto (V-014: LFI variante)

ADMIN
  GET    /api/admin/users             — Listar usuarios (V-028: broken access)
  POST   /api/admin/import/url        — Importar desde URL (V-015: SSRF)
  POST   /api/admin/import/xml        — Importar desde XML (V-016: XXE)
  POST   /api/admin/email-template/preview — Preview email (V-027: SSTI)
  PUT    /api/orders/{id}/status      — Cambiar estado (V-028)
  POST   /api/admin/healthcheck       — Health check (V-021: RCE en chain)

REDIRECT
  GET    /api/redirect?url=           — Redireccion (V-005: header injection)
```

### GraphQL API

```graphql
# V-020: Introspection enabled, no depth limit, no auth on mutations

type Query {
  products(search: String, category: String): [Product]
  product(id: ID!): Product
  users(limit: Int): [User]          # Enumeration
  user(id: ID!): User                # IDOR
  orders(userId: ID!): [Order]       # IDOR
  me: User
}

type Mutation {
  updateUser(id: ID!, input: UserInput!): User    # No auth check
  createReview(productId: ID!, input: ReviewInput!): Review
  deleteProduct(id: ID!): Boolean                  # No admin check
}

type User {
  id: ID!
  email: String        # PII exposure
  name: String
  role: String         # Exposes role
  orders: [Order]      # Nested = IDOR
  address: String      # PII exposure
}
```

---

## 10. Páginas Frontend

### 10.1 Home Page
- Hero banner con "Debuggy" mascota
- Carrusel de bugs destacados
- Sección "Bug of the Week"
- Newsletter signup (CSRF vulnerable)

### 10.2 The Hive (Catálogo)
- Grid de productos con filtros (categoría, precio, popularidad)
- Barra de búsqueda (V-001, V-002)
- Filtro por URL hash (V-003, V-007)
- Angular 1.x widget para "trending" (V-004)

### 10.3 Product Detail
- Galería de fotos del bug
- Descripción, precio, reviews
- "Add to Colony" (add to cart)
- Sección de reviews con upload de fotos (V-017)

### 10.4 My Colony (Perfil)
- Datos del usuario (editable: V-018)
- Historial de pedidos (V-009, V-010)
- Mis reviews
- Preferencias (cookie serializada: V-026)

### 10.5 Bug Blog
- Artículos sobre cuidado de insectos
- Búsqueda con Angular template (V-004)
- Adjuntos descargables (V-014)

### 10.6 Checkout Flow
- Resumen de carrito
- Cupones (V-024)
- Pago (V-023, V-025)

### 10.7 Nest Admin (Panel de Admin)
- Dashboard con estadísticas
- Gestión de productos (import XML/URL: V-015, V-016)
- Gestión de usuarios (V-028)
- Email templates (V-027)
- Health checks (V-021 chain)

---

## 11. Deployment

### fly.io (Producción)

```bash
# Primera vez
fly launch --name bugstore
fly postgres create --name bugstore-db
fly postgres attach bugstore-db

# Configurar
fly secrets set BUGSTORE_JWT_SECRET=bugstore_secret_2024
fly secrets set BUGSTORE_DIFFICULTY=2

# Deploy
fly deploy

# BugStore disponible en https://bugstore.fly.dev
```

### Docker Local (Desarrollo)

```bash
git clone https://github.com/BugTraceAI/BugStore.git
cd BugStore

# Con SQLite (zero dependencies)
docker build -t bugstore .
docker run -p 3000:8080 -e DATABASE_URL=sqlite:///data/bugstore.db bugstore

# Con PostgreSQL local
docker run -d --name bugstore-db -e POSTGRES_PASSWORD=bugstore postgres:16
docker run -p 3000:8080 -e DATABASE_URL=postgres://postgres:bugstore@bugstore-db:5432/postgres --link bugstore-db bugstore
```

### Sin Docker (Desarrollo rápido)

```bash
cd BugStore

# Backend
cd backend && pip install -r requirements.txt
DATABASE_URL=sqlite:///data/bugstore.db python main.py

# Frontend (en otra terminal)
cd frontend && npm install && npm run build
# Los archivos build se sirven estáticamente desde FastAPI
```

### Variables de Entorno

```env
# === Database ===
DATABASE_URL=sqlite:///data/bugstore.db    # SQLite local (default dev)
# DATABASE_URL=postgres://user:pass@host:5432/bugstore  # PostgreSQL (fly.io)

# === Security Levels ===
BUGSTORE_DIFFICULTY=2          # 0=No Protection, 1=Production, 2=Hardened (default)
BUGSTORE_WAF_ENABLED=true      # Caddy+Coraza WAF activo (default: true en Level 2)

# === Auth ===
BUGSTORE_JWT_SECRET=bugstore_secret_2024   # Deliberately weak
BUGSTORE_JWT_EXPIRY=86400                  # 24h in seconds

# === Server ===
PORT=8080                      # fly.io asigna automáticamente
BUGSTORE_HOST=0.0.0.0
BUGSTORE_DEBUG=false           # Stack traces (auto true en Level 0)

# === File Storage ===
BUGSTORE_UPLOAD_DIR=/data/uploads          # Directorio de uploads
BUGSTORE_DATA_DIR=/data                    # SQLite DB + logs

# === WAF ===
BUGSTORE_WAF_PARANOIA=2        # ModSecurity paranoia level (1-4)
BUGSTORE_WAF_LOG=true          # Log blocked requests

# === Seeding ===
BUGSTORE_AUTO_SEED=true        # Seed DB on first run if empty
BUGSTORE_SEED_DIR=./data       # Directory with JSON seed files
```

### fly.toml

```toml
app = "bugstore"
primary_region = "mad"  # Madrid

[build]

[env]
  BUGSTORE_DIFFICULTY = "2"
  BUGSTORE_AUTO_SEED = "true"
  BUGSTORE_WAF_ENABLED = "true"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[mounts]
  source = "bugstore_data"
  destination = "/data"
```

---

## 12. Deliverables y Milestones

### M1 — Core Application (Semana 1-2)
- [ ] Setup Docker Compose (PostgreSQL + backend + frontend)
- [ ] Schema de base de datos
- [ ] CRUD de productos, usuarios, pedidos
- [ ] Auth con JWT (deliberadamente vulnerable)
- [ ] Frontend: Home, Catálogo, Login, Perfil
- [ ] Datos seed (12 bugs, 4 usuarios)

### M2 — Tier 1 Vulnerabilities (Semana 3)
- [ ] V-001 a V-008 implementadas
- [ ] Verificación manual de cada vuln
- [ ] Scan con Burp Suite Free → baseline de detección

### M3 — Tier 2 Vulnerabilities (Semana 4-5)
- [ ] V-009 a V-020 implementadas
- [ ] GraphQL endpoint
- [ ] XML/URL import endpoints
- [ ] File upload para reviews
- [ ] Scan con BugTraceAI → verificar detección superior

### M4 — Tier 3 Vulnerabilities + WAF (Semana 6)
- [ ] V-021 a V-030 implementadas
- [ ] Exploitation chains verificadas end-to-end
- [ ] ModSecurity WAF configurable
- [ ] 3 difficulty levels operativos

### M5 — Scoring y Documentación (Semana 7)
- [ ] Sistema de scoring automatizado
- [ ] Dashboard de resultados de benchmark
- [ ] Documentación: setup, walkthrough, soluciones
- [ ] VULNS.md con guía de spoilers
- [ ] Publicación en GitHub

---

## 13. Métricas de Éxito

1. **BugTraceAI detecta >75% del total** de vulnerabilidades (>277 puntos)
2. **Burp Suite Pro detecta <30%** del total (<111 puntos)
3. **Gap Tier 2**: BugTraceAI encuentra >80% de Tier 2, Burp <30%
4. **Gap Tier 3**: BugTraceAI encuentra >60% de Tier 3, Burp <5%
5. **Zero false positives** en BugTraceAI para BugStore
6. **Docker compose up** funcional en <2 minutos
7. **Documentación** suficiente para que cualquiera pueda replicar el benchmark

---

## 14. Consideraciones Legales y Éticas

- BugStore es **deliberadamente vulnerable** y NUNCA debe desplegarse en producción real
- Banner claro en todas las páginas: "This is a deliberately vulnerable application. DO NOT use in production."
- Sin conexión a servicios reales de pago
- Datos ficticios (no PII real)
- Licencia MIT (open source)
- Disclosure responsable: las vulnerabilidades están documentadas por diseño
