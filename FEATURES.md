# BugStore - Feature List

## Detailed Feature Breakdown

---

## Module 1: Core E-Commerce Platform

### F-001: Product Catalog (The Hive)
- Grid layout con tarjetas de productos (foto, nombre, especie, precio)
- Filtrado por categoría: Beetles, Butterflies, Arachnids, Flying, Crawling, Exotic
- Filtrado por precio: rango min/max con slider
- Filtrado por nivel de cuidado: Beginner, Intermediate, Expert
- Ordenación: precio, popularidad, nombre, recién añadidos
- Paginación: 12 productos por página
- Búsqueda de texto libre en nombre, especie y descripción
- Sección "Bug of the Week" destacada en home
- Sección "Bug Nursery" para nuevas llegadas (últimos 7 días)
- Cada producto muestra: nombre, especie (latín), personalidad, precio, nivel de cuidado, rating promedio, fotos

### F-002: Product Detail Page
- Galería de fotos del bug (3-5 imágenes por producto)
- Información completa: nombre, especie, descripción larga, personalidad, esperanza de vida, dieta, hábitat
- Precio y botón "Add to Colony" (agregar al carrito)
- Selector de cantidad
- Sección de "Care Guide" (guía de cuidados embebida)
- Badge de disponibilidad: In Stock, Low Stock, Out of Stock
- Productos relacionados ("Bugs you might also love")
- Sección de reviews de clientes con rating (1-5 estrellas)
- Upload de fotos en reviews ("Show us your bug!")

### F-003: Shopping Cart
- Visualización de items con foto thumbnail, nombre, cantidad, precio unitario, subtotal
- Modificar cantidad inline (+ / -)
- Eliminar items individuales
- Botón "Empty Colony" (vaciar carrito)
- Subtotal, impuestos (8%), total
- Campo de cupón de descuento con botón "Apply"
- Cupones válidos: WELCOME10 (10%), BUGFAN20 (20%), FIRSTBUG (15%)
- Persistencia del carrito en DB por session_id (JWT stateless, sin Redis)
- Contador de items visible en el header (badge en icono de carrito)

### F-004: Checkout Flow
- Step 1: Shipping Info (nombre, dirección, ciudad, código postal, país)
- Step 2: Payment (número de tarjeta, expiración, CVV — simulado, no real)
- Step 3: Order Review (resumen de pedido, dirección, método de pago)
- Step 4: Confirmation (número de pedido, email de confirmación simulado)
- Cálculo de envío: Standard ($5.99), Express ($12.99), Free (pedidos >$100)
- Resumen de precio: subtotal, descuentos, envío, impuestos, total
- El total se envía desde frontend al backend (deliberado: V-023)
- No hay rate limiting en el endpoint de checkout (deliberado: V-025)

### F-005: Order Management
- Vista "My Orders" con lista de pedidos del usuario
- Cada pedido muestra: ID, fecha, estado (Pending, Processing, Shipped, Delivered), total
- Detalle de pedido: items comprados, dirección de envío, tracking number (simulado)
- Estados de pedido con timeline visual
- Endpoint directo por ID numérico sin verificación de ownership (deliberado: V-009)

---

## Module 2: User System

### F-006: Registration
- Formulario: nombre, email, username, password, confirmación de password
- Validación frontend: email format, password min 6 chars, username alfanumérico
- Sin validación backend de caracteres especiales en username (deliberado: V-019)
- Email de bienvenida simulado (log en consola)
- Auto-login tras registro (devuelve JWT)
- Avatar por defecto basado en inicial del nombre

### F-007: Authentication (JWT)
- Login con email/username + password
- JWT token en response body (no en cookie HttpOnly — deliberado: V-008)
- Token almacenado en localStorage (deliberado: accesible via XSS)
- JWT firmado con HS256, secret débil: `bugstore_secret_2024` (deliberado: V-011)
- Backend acepta `alg: none` (deliberado: V-011)
- No valida `iss`, `aud`, `exp` con margen razonable (deliberado)
- Payload del JWT incluye: userId, email, role, name
- No hay refresh token — el JWT dura 24h
- Logout = borrar token del localStorage (sin invalidación server-side)

### F-008: User Profile (My Colony)
- Ver datos del usuario: nombre, email, username, avatar, fecha de registro
- Editar perfil: nombre, email, bio, avatar URL
- Cambiar password (current + new + confirm)
- Endpoint PUT acepta cualquier campo incluyendo `role` (deliberado: V-018)
- Ver historial de pedidos
- Ver reviews publicadas
- Preferencias de usuario serializadas en cookie con pickle (deliberado: V-026)
- Endpoint de perfil accesible por userId numérico sin auth check (deliberado: V-010)

### F-009: User Roles
- 3 roles: `user`, `staff`, `admin`
- `user`: comprar, crear reviews, ver su perfil y pedidos
- `staff`: todo lo de user + moderar reviews + ver todos los pedidos
- `admin`: todo lo de staff + gestión de productos + import/export + gestión de usuarios + email templates + health checks
- Role embebido en JWT (no se re-verifica en backend para algunos endpoints — deliberado: V-028)

---

## Module 3: Content System

### F-010: Bug Blog
- Lista de artículos con thumbnail, título, excerpt, fecha, autor
- Artículos server-side rendered con Jinja2
- Sección de búsqueda renderizada con Angular 1.7.x legacy widget (deliberado: V-004)
- Cada artículo tiene: título, body (markdown rendered), autor, fecha, tags, adjuntos
- Artículos seed:
  - "5 Tips for First-Time Bug Owners"
  - "The Complete Beetle Care Guide"
  - "Why Mantises Make the Best Pets"
  - "Building Your First Ant Colony"
  - "Night Bugs: Caring for Fireflies and Luna Moths"
- Adjuntos descargables por nombre de archivo via query param (deliberado: V-014)

### F-011: Reviews System
- Rating 1-5 estrellas + texto de review
- Upload de fotos en la review (hasta 3 fotos por review)
- File upload acepta cualquier extensión en backend (deliberado: V-017)
- Mostrar reviewer name, rating, texto, fotos, fecha
- Rating promedio calculado y mostrado en product card
- Cualquier usuario puede borrar cualquier review via DELETE endpoint (deliberado: V-028)
- Reviews muestran username del reviewer (que puede contener SQLi si V-019 fue explotado)

### F-012: The Swarm (Forum)
- Categorías: General, Care Tips, Show & Tell, Bug Identification, Marketplace
- Thread list: título, autor, fecha, número de respuestas
- Thread detail: post original + respuestas ordenadas cronológicamente
- Crear thread: título + body
- Responder a thread: body
- No hay sanitización de HTML en posts del foro (deliberado: stored XSS adicional)
- Paginación de threads y respuestas

---

## Module 4: Admin Panel (Nest Admin)

### F-013: Admin Dashboard
- Estadísticas generales: total users, total orders, revenue, products in stock
- Gráfico de ventas últimos 30 días (Chart.js)
- Últimos 10 pedidos con estado
- Top 5 productos más vendidos
- Accesible con JWT de usuario normal si se accede directamente al endpoint (deliberado: V-028)

### F-014: Product Management
- CRUD de productos: crear, ver, editar, eliminar
- Import desde URL: `POST /api/admin/import/url` con body `{source_url}` (deliberado: V-015)
- Import desde XML: `POST /api/admin/import/xml` con upload de archivo XML (deliberado: V-016)
- Export a JSON/CSV
- Gestión de fotos de productos
- Categorías editables

### F-015: User Management
- Lista de usuarios con búsqueda y filtros
- Ver detalle de usuario: datos, pedidos, reviews
- Cambiar rol de usuario
- Desactivar/activar usuario
- Endpoint sin auth check robusto (deliberado: V-028)

### F-016: Email Template System
- Editor de templates de email (para notificaciones)
- Preview en vivo del template renderizado
- Templates procesados con Jinja2 sin sandbox (deliberado: V-027)
- Templates predefinidos: Welcome, Order Confirmation, Shipping Update, Password Reset
- Variables disponibles: `{{user.name}}`, `{{order.id}}`, `{{order.total}}`

### F-017: Health Check System
- Endpoint que ejecuta system commands para verificar salud del servidor
- Muestra: uptime, disk space, memory usage, database status
- Acepta parámetro `cmd` para custom checks (deliberado: V-021 chain → RCE)
- Solo accesible como admin (pero admin se puede conseguir via V-011 o V-021)

---

## Module 5: API Layer

### F-018: REST API
- Todos los endpoints documentados en sección 9 del PRD
- Content-Type: `application/json`
- Auth: Bearer token JWT en header Authorization
- Errores en Level 0: stack traces completos con paths internos
- Errores en Level 1+: mensajes genéricos (`{"error": "Something went wrong"}`)
- CORS: `Access-Control-Allow-Origin: *` (deliberado: V-008)
- No hay CSRF protection (deliberado)
- Rate limiting: ninguno en Level 0, básico en Level 1, agresivo en Level 2

### F-019: GraphQL API
- Endpoint único: `POST /api/graphql`
- Introspection habilitada (deliberado: V-020)
- Sin límite de query depth (deliberado: V-020)
- Mutations sin verificación de autorización (deliberado: V-020)
- Queries permiten enumerar usuarios y acceder a pedidos ajenos (deliberado: V-020)
- GraphQL Playground/GraphiQL habilitado en development
- Schema expone PII: email, dirección, role (deliberado)

### F-020: Redirect Service
- `GET /api/redirect?url={destination}`
- Usado internamente para tracking de clicks en blog
- Valor de URL insertado directamente en header Location sin validación (deliberado: V-005)
- Acepta cualquier URL incluyendo javascript: y data: schemes (deliberado: V-006)

---

## Module 6: Security Infrastructure

### F-021: WAF Layer (Caddy + Coraza)
- Caddy como reverse proxy con coraza-waf plugin (OWASP CRS compatible) dentro del mismo pod
- OWASP Core Rule Set (CRS) v4
- Rules activas: SQL injection, XSS, LFI, RCE, protocol enforcement
- Configurable via `BUGSTORE_WAF_ENABLED` env var
- Logs de WAF accesibles via stdout
- Paranoia Level configurable (1-4) via `BUGSTORE_WAF_PARANOIA`
- Level 0/1: Caddy desactivado, FastAPI sirve directo en port 8080
- Level 2 (Hardened): Caddy+Coraza activo por defecto, proxy a FastAPI

### F-022: Difficulty Level System
- Controlado por `BUGSTORE_DIFFICULTY` env var (0, 1, 2)
- Level 0: sin filtros, errors verbosos, sin rate limit, sin WAF
- Level 1: blacklist básica de caracteres (`<`, `>`, `'`, `"`, `;` en algunos params), error messages genéricos, rate limit 100 req/min, headers parciales (X-Frame-Options pero no CSP)
- Level 2: WAF Caddy+Coraza activo, CSP strict, rate limit 30 req/min, validación server+client, HSTS activo
- Middleware que lee env var y aplica filtros correspondientes
- Los 3 levels mantienen todas las 30 vulns — pero aumentan la dificultad de explotación

### F-023: Cookie & Session Config
- Session cookie `session_id`: sin Secure flag, sin HttpOnly, sin SameSite (deliberado: V-008)
- Tracking cookie `TrackingId`: valor en Base64, decodificado e insertado en query SQL (deliberado: V-013)
- Preferences cookie `user_prefs`: serializada con pickle (deliberado: V-026)
- Category cookie: refleja valor del param sin sanitizar
- JWT almacenado en localStorage, no en cookie HttpOnly (deliberado)

---

## Module 7: Data & Seeding

### F-024: Product Seed Data
- 12 productos (bugs como mascotas) con datos completos
- Cada producto: id, name, species, latin_name, description, personality, care_level, price, diet, habitat, lifespan, images[], category, stock, rating_avg, reviews_count
- Categorías: Beetles (3), Butterflies (2), Flying (2), Crawling (3), Exotic (2)
- Precios rango: $14.99 - $199.99
- Datos almacenados en `data/products.json` — cargados en DB al inicializar

### F-025: User Seed Data
- 4 usuarios predefinidos con roles distintos
- admin: `admin@bugstore.local` / `admin123` (MD5 sin salt — deliberado para chain V-021)
- user1: `john@bugstore.local` / `password123`
- user2: `jane@bugstore.local` / `ilovemantis`
- staff: `carlos@bugstore.local` / `staff2024`
- Passwords hasheadas con MD5 sin salt en DB (deliberado: fácil de crackear)
- Datos almacenados en `data/users.json`

### F-026: Blog Seed Data
- 5 artículos sobre cuidado de insectos
- Cada artículo: id, slug, title, excerpt, body (markdown), author, date, tags[], attachments[]
- Adjuntos: PDFs de guías de cuidado (archivos reales en el filesystem)
- Datos almacenados en `data/blog_posts.json`

### F-027: Order & Review Seed Data
- 8 pedidos pre-generados distribuidos entre los 4 usuarios
- 15 reviews pre-generadas con ratings variados (1-5 estrellas)
- Datos generados al ejecutar `seed.py` (auto-seed en primer arranque si `BUGSTORE_AUTO_SEED=true`)

---

## Module 8: Frontend UI

### F-028: Layout & Navigation
- Header: logo BugStore, navegación principal (The Hive, Blog, The Swarm), icono cuenta, icono carrito con badge
- Footer: links, copyright, disclaimer de seguridad
- Responsive: mobile-first (breakpoints 640, 768, 1024, 1280)
- Banner superior fijo: "This is a deliberately vulnerable application. DO NOT deploy in production."
- Sidebar de categorías en catálogo
- Breadcrumbs en product detail y blog post

### F-029: Theme & Branding
- Color palette: verde bosque (#2D5016) primario, marrón tierra (#8B6914) secundario, beige claro (#F5F0E1) fondo
- Tipografía: Inter para body, Playfair Display para headings
- Mascota "Debuggy" (mariquita) en logo y 404 page
- Iconos de insectos custom para categorías
- Animaciones sutiles: hover en product cards, transiciones de página
- Dark mode toggle (bonus — no es vulnerable, solo UX)

### F-030: Legacy Angular Widget
- Widget "Trending Bugs" en sidebar del blog
- Renderizado con Angular 1.7.7 (deliberado: versión vulnerable)
- Template interpola input de usuario sin sanitizar (deliberado: V-004)
- Cargado como script independiente (`/resources/js/angular_1-7-7.js`)
- Solo afecta a la sección de blog, no al resto de la app (React)

### F-031: Client-Side JavaScript
- jQuery 2.1.4 cargado globalmente (deliberado: V-030)
- Lodash 4.17.15 cargado globalmente (deliberado: V-030)
- Función `deepMerge()` custom para parsear filtros de URL (deliberado: V-007)
- Hash fragment handler que usa `innerHTML` (deliberado: V-003)
- `scanme.js` con event handlers para interacción
- `subscribeNow.js` para newsletter (CSRF vulnerable)

---

## Module 9: Infrastructure & DevOps

### F-032: Single Pod Deployment (fly.io)
- Single `Dockerfile` multi-stage: build frontend (Node 20 + Vite) → run backend (Python 3.11 + FastAPI)
- FastAPI sirve frontend estático + API + uploads desde un solo proceso
- Database configurable via `DATABASE_URL`: PostgreSQL (fly.io managed) o SQLite (local/dev)
- WAF via Caddy + coraza-waf plugin como reverse proxy dentro del mismo container (Level 2)
- `fly.toml` con config de deploy: region, mounts para `/data`, auto-scaling
- Volume `/data` para: SQLite DB, uploads, logs (persiste entre deploys)
- `.env` / `fly secrets` para toda la configuración
- Auto-seed en primera ejecución si DB está vacía
- Health check endpoint `/api/health`
- Desarrollo local: `docker build && docker run` o `python main.py` directo

### F-033: Database Schema
- Table `users`: id, username, email, password_hash, name, bio, avatar_url, role, created_at, updated_at
- Table `products`: id, name, species, latin_name, description, personality, care_level, price, diet, habitat, lifespan, category, stock, rating_avg, reviews_count, created_at
- Table `product_images`: id, product_id, url, alt_text, sort_order
- Table `orders`: id, user_id, status, total, shipping_cost, tax, discount, shipping_address (JSON), tracking_number, created_at, updated_at
- Table `order_items`: id, order_id, product_id, quantity, unit_price
- Table `reviews`: id, user_id, product_id, rating, text, created_at
- Table `review_photos`: id, review_id, file_path, original_name, mime_type
- Table `blog_posts`: id, slug, title, excerpt, body, author, tags (JSON), created_at
- Table `blog_attachments`: id, post_id, file_name, file_path
- Table `cart_items`: id, session_id, product_id, quantity
- Table `coupons`: id, code, discount_percent, max_uses, current_uses, active
- Table `forum_threads`: id, user_id, category, title, body, created_at
- Table `forum_replies`: id, thread_id, user_id, body, created_at
- Queries con concatenación de strings directa (deliberado: V-001, V-012, V-013, V-019)
- Passwords almacenados en MD5 sin salt (deliberado: V-021 chain)

### F-034: Logging & Monitoring
- Request logging: method, path, status code, response time, user-agent
- WAF logs: blocked requests con rule ID y payload
- Error logs con stack traces (Level 0) o sin ellos (Level 1+)
- Log rotation: 7 días de retención
- Accesibles via `fly logs` o `docker logs bugstore`

---

## Module 10: Scoring & Benchmarking

### F-035: Vulnerability Verification Endpoint
- `GET /api/debug/vulns` (solo accesible en Level 0)
- Lista todas las 30 vulnerabilidades con estado: planted, exploitable, verified
- Permite verificar que cada vuln funciona tras deploy
- Incluye PoC payload de ejemplo para cada una
- Deshabilitado en Level 1 y Level 2

### F-036: Scoring Dashboard
- Página web separada: `/benchmark`
- Input: archivo JSON con resultados de un escáner (formato genérico)
- Parsea findings del escáner y los mapea a las 30 vulns conocidas
- Calcula puntuación total, por tier, y por categoría de vuln
- Comparativa visual: gráfico radar escáner A vs escáner B
- Export de resultados a PDF/JSON
- Tabla de leaderboard: nombre del escáner, puntuación, % detección por tier

### F-037: Scanner Result Importers
- Importador Burp Suite: parsea XML export de Burp
- Importador BugTraceAI: parsea JSON report de BTAI
- Importador OWASP ZAP: parsea JSON/XML de ZAP
- Importador Nuclei: parsea JSON output de Nuclei
- Importador genérico: formato JSON con campos `{vuln_type, url, parameter, confidence}`
- Matching engine: mapea findings del escáner a las 30 vulns de BugStore usando fuzzy matching en URL + param + vuln type

---

## Module 11: Documentation

### F-038: User-Facing Docs
- README.md: quick start, screenshots, qué es BugStore
- SETUP.md: requisitos, instalación paso a paso, configuración avanzada
- FAQ.md: preguntas frecuentes

### F-039: Security Docs (Spoilers)
- VULNS.md: lista completa de 30 vulnerabilidades con walkthrough de explotación
- Organizado por tier con difficulty rating
- Cada vuln incluye: descripción, ubicación, PoC, impacto, remediación
- Marcado como SPOILER — para instructores y evaluadores, no para estudiantes

### F-040: Benchmark Docs
- SCORING.md: sistema de puntuación explicado
- BENCHMARK-GUIDE.md: cómo ejecutar un benchmark completo paso a paso
- RESULTS-TEMPLATE.md: template para documentar resultados de benchmark
- Comparativa de referencia: Burp Pro vs BugTraceAI vs ZAP (resultados esperados)

---

## Feature Summary

| Module | Features | Count |
|--------|----------|:-----:|
| Core E-Commerce | Catalog, Product Detail, Cart, Checkout, Orders | 5 |
| User System | Registration, Auth, Profile, Roles | 4 |
| Content | Blog, Reviews, Forum | 3 |
| Admin Panel | Dashboard, Products, Users, Email, Health | 5 |
| API Layer | REST, GraphQL, Redirect | 3 |
| Security Infra | WAF, Difficulty Levels, Cookies | 3 |
| Data & Seeding | Products, Users, Blog, Orders/Reviews | 4 |
| Frontend UI | Layout, Theme, Angular Widget, Client JS | 4 |
| Infrastructure | fly.io Deploy, DB Schema, Logging | 3 |
| Scoring | Verification, Dashboard, Importers | 3 |
| Documentation | User Docs, Security Docs, Benchmark Docs | 3 |
| **Total** | | **40** |

### Vulnerability Coverage Map

| Feature | Vulnerabilities Embedded |
|---------|------------------------|
| F-001 Catalog | V-001 (SQLi), V-002 (XSS), V-003 (DOM XSS), V-007 (Proto Pollution) |
| F-002 Product Detail | V-014 (LFI), V-017 (File Upload) |
| F-003 Cart | V-024 (Coupon Stacking) |
| F-004 Checkout | V-023 (Price Manipulation), V-025 (Race Condition) |
| F-005 Orders | V-009 (IDOR) |
| F-006 Registration | V-019 (Second-Order SQLi) |
| F-007 Auth | V-011 (JWT), V-008 (Misconfig) |
| F-008 Profile | V-010 (IDOR), V-018 (Mass Assignment), V-026 (Deserialization) |
| F-010 Blog | V-004 (CSTI), V-014 (LFI variant) |
| F-011 Reviews | V-017 (File Upload), V-028 (Broken Access) |
| F-013 Dashboard | V-028 (Broken Access) |
| F-014 Product Mgmt | V-015 (SSRF), V-016 (XXE) |
| F-016 Email Templates | V-027 (SSTI) |
| F-017 Health Check | V-021 (Chain: RCE) |
| F-019 GraphQL | V-020 (GraphQL Injection) |
| F-020 Redirect | V-005 (Header Injection), V-006 (Open Redirect) |
| F-021 WAF | Bypass target for all vulns |
| F-023 Cookies | V-008 (Misconfig), V-013 (Blind SQLi OOB), V-026 (Deserialization) |
| F-030 Angular Widget | V-004 (CSTI), V-030 (Vulnerable Deps) |
| F-031 Client JS | V-003 (DOM XSS), V-007 (Proto Pollution), V-030 (Vulnerable Deps) |
| F-033 DB Schema | V-001, V-012, V-013, V-019 (all SQLi variants), V-021 (MD5 passwords) |
