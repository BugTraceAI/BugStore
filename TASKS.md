# BugStore - Task Breakdown

## Implementation Tasks per Feature

---

## Module 1: Core E-Commerce Platform

### F-001: Product Catalog (The Hive)

**Backend**
- [ ] Crear modelo `Product` en DB con todos los campos (name, species, latin_name, description, personality, care_level, price, diet, habitat, lifespan, category, stock, rating_avg, reviews_count)
- [ ] Crear modelo `ProductImage` (id, product_id, url, alt_text, sort_order)
- [ ] Endpoint `GET /api/catalog` con paginación (limit/offset, 12 por defecto)
- [ ] Filtro por categoría: `?category=Beetles` — query con concatenación de strings (V-001)
- [ ] Filtro por precio: `?price_min=X&price_max=Y` — inyectable en WHERE (V-012)
- [ ] Filtro por care_level: `?care_level=Beginner`
- [ ] Ordenación: `?sort=price_asc|price_desc|name|popularity|newest`
- [ ] Búsqueda: `?search=mantis` — concatenación directa en LIKE (V-001)
- [ ] Endpoint `GET /api/catalog/featured` para Bug of the Week
- [ ] Endpoint `GET /api/catalog/new` para Bug Nursery (últimos 7 días)

**Frontend**
- [ ] Componente `ProductGrid` con tarjetas (foto, nombre, especie, precio, rating)
- [ ] Componente `CategorySidebar` con filtros de categoría
- [ ] Componente `PriceRangeSlider` para filtro de precio
- [ ] Componente `CareFilter` para nivel de cuidado
- [ ] Componente `SortDropdown` para ordenación
- [ ] Componente `SearchBar` que refleja input en `<h2>Resultados para: {input}</h2>` sin sanitizar (V-002)
- [ ] Componente `Pagination` con números de página
- [ ] Hash fragment handler: leer `#category=X` y setear filtro via innerHTML (V-003)
- [ ] Función `deepMerge()` para parsear filtros de URL con Prototype Pollution (V-007)
- [ ] Sección "Bug of the Week" en home page
- [ ] Sección "Bug Nursery" con badge "NEW"

### F-002: Product Detail Page

**Backend**
- [ ] Endpoint `GET /api/catalog/{id}` — devuelve producto completo con imágenes
- [ ] Endpoint `GET /api/catalog/{id}/image?file={filename}` — serve de imagen por filename, concatenando con directorio base sin sanitizar (V-014)
- [ ] Endpoint `GET /api/catalog/{id}/related` — productos de la misma categoría

**Frontend**
- [ ] Componente `ImageGallery` con thumbnail selector y zoom
- [ ] Componente `ProductInfo` con todos los datos del bug
- [ ] Componente `QuantitySelector` (+ / -)
- [ ] Botón "Add to Colony" que llama a `POST /api/cart/add`
- [ ] Componente `CareGuide` con info de cuidados
- [ ] Badge de stock: verde "In Stock", amarillo "Low Stock" (<5), rojo "Out of Stock"
- [ ] Sección "Bugs you might also love" con ProductGrid de related
- [ ] Sección de reviews integrada (usa componentes de F-011)

### F-003: Shopping Cart

**Backend**
- [ ] Crear modelo `CartItem` (id, session_id, product_id, quantity)
- [ ] Crear modelo `Coupon` (id, code, discount_percent, max_uses, current_uses, active)
- [ ] Endpoint `GET /api/cart` — items del carrito actual
- [ ] Endpoint `POST /api/cart/add` — añadir producto (body: product_id, quantity)
- [ ] Endpoint `PUT /api/cart/{itemId}` — actualizar cantidad
- [ ] Endpoint `DELETE /api/cart/{itemId}` — eliminar item
- [ ] Endpoint `DELETE /api/cart` — vaciar carrito
- [ ] Endpoint `POST /api/cart/apply-coupon` — aplicar cupón sin limitar número de aplicaciones (V-024)
- [ ] Seed de cupones: WELCOME10 (10%), BUGFAN20 (20%), FIRSTBUG (15%)
- [ ] Calcular subtotal, tax (8%), shipping, total

**Frontend**
- [ ] Componente `CartItem` con thumbnail, nombre, cantidad editable, precio, subtotal
- [ ] Botones +/- para modificar cantidad inline
- [ ] Botón eliminar por item
- [ ] Botón "Empty Colony"
- [ ] Componente `CouponInput` con campo y botón "Apply"
- [ ] Componente `CartSummary` con subtotal, descuento, tax, total
- [ ] Badge en header con contador de items (actualizar on cart change)
- [ ] Persistencia en localStorage (session_id)

### F-004: Checkout Flow

**Backend**
- [ ] Endpoint `POST /api/cart/checkout` — procesar pedido
- [ ] Aceptar `total` del body del request sin re-verificar contra DB (V-023)
- [ ] No aplicar rate limiting en checkout (V-025)
- [ ] No usar transacciones atómicas (V-025: race condition)
- [ ] Crear order, order_items, actualizar stock
- [ ] Generar tracking number simulado
- [ ] Calcular shipping: Standard $5.99, Express $12.99, Free si >$100

**Frontend**
- [ ] Componente `CheckoutStep1` — Shipping Info (nombre, dirección, ciudad, zip, país)
- [ ] Componente `CheckoutStep2` — Payment (card number, exp, cvv — simulado)
- [ ] Componente `CheckoutStep3` — Order Review (resumen completo)
- [ ] Componente `CheckoutStep4` — Confirmation (order number, mensaje)
- [ ] Stepper visual con indicador de progreso
- [ ] Enviar total calculado en frontend al backend (V-023)
- [ ] Selector de shipping method

### F-005: Order Management

**Backend**
- [ ] Endpoint `GET /api/orders` — listar pedidos del usuario autenticado
- [ ] Endpoint `GET /api/orders/{id}` — detalle de pedido SIN verificar ownership (V-009)
- [ ] Cada pedido incluye: items, shipping address, tracking, status history

**Frontend**
- [ ] Página "My Orders" con lista de pedidos
- [ ] Componente `OrderCard` con ID, fecha, estado, total
- [ ] Página detalle de pedido con items, dirección, tracking
- [ ] Componente `OrderTimeline` con estados visuales (Pending → Processing → Shipped → Delivered)

---

## Module 2: User System

### F-006: Registration

**Backend**
- [ ] Endpoint `POST /api/auth/register` — crear usuario
- [ ] Aceptar username con caracteres especiales sin sanitizar (V-019)
- [ ] Hashear password con MD5 sin salt (deliberado: V-021 chain)
- [ ] Devolver JWT tras registro exitoso
- [ ] Log "welcome email sent" en consola (no enviar email real)
- [ ] Generar avatar URL basado en inicial del nombre

**Frontend**
- [ ] Formulario de registro: name, email, username, password, confirm password
- [ ] Validación client-side: email format, password min 6, username alfanumérico
- [ ] Mostrar errores de validación inline
- [ ] Redirect a home tras registro exitoso
- [ ] Guardar JWT en localStorage

### F-007: Authentication (JWT)

**Backend**
- [ ] Endpoint `POST /api/auth/login` — autenticar y devolver JWT
- [ ] Firmar JWT con HS256, secret `bugstore_secret_2024` (V-011)
- [ ] Aceptar tokens con `alg: none` como válidos (V-011)
- [ ] No validar `iss`, `aud` en tokens recibidos (V-011)
- [ ] Payload JWT: userId, email, role, name
- [ ] Token expiration: 24h
- [ ] Middleware `get_current_user()` que decodifica JWT del header Authorization
- [ ] No invalidar tokens server-side en logout

**Frontend**
- [ ] Formulario de login: email/username + password
- [ ] Guardar JWT en localStorage (no en HttpOnly cookie — deliberado)
- [ ] Hook `useAuth()` con estado de autenticación
- [ ] Redirect a login si no autenticado en rutas protegidas
- [ ] Logout = borrar localStorage + redirect a home

### F-008: User Profile (My Colony)

**Backend**
- [ ] Endpoint `GET /api/users/{id}/profile` — SIN verificar que el requester sea el owner (V-010)
- [ ] Endpoint `PUT /api/users/{id}` — aceptar CUALQUIER campo del body incluyendo `role` (V-018)
- [ ] Endpoint `GET /api/users/me` — perfil del usuario actual, query con username sin sanitizar (V-019 trigger)
- [ ] Endpoint `PUT /api/users/{id}/password` — cambiar password
- [ ] Serializar preferencias de usuario con pickle en cookie `user_prefs` (V-026)
- [ ] Deserializar cookie `user_prefs` con `pickle.loads()` al cargar perfil (V-026)

**Frontend**
- [ ] Página de perfil con datos del usuario
- [ ] Formulario de edición inline: nombre, email, bio, avatar URL
- [ ] Formulario de cambio de password
- [ ] Sección "My Orders" (reutiliza componentes de F-005)
- [ ] Sección "My Reviews" con lista de reviews publicadas

### F-009: User Roles

**Backend**
- [ ] Definir 3 roles en modelo: `user`, `staff`, `admin`
- [ ] Middleware `require_role(role)` que verifica role del JWT SIN re-consultar DB (V-028)
- [ ] Aplicar middleware a endpoints de admin
- [ ] Dejar algunos endpoints admin sin middleware (deliberado: V-028)

**Frontend**
- [ ] Mostrar/ocultar elementos de UI según role (admin panel link, moderation tools)
- [ ] Guard de ruta para `/admin/*` basado en role del JWT decodificado client-side

---

## Module 3: Content System

### F-010: Bug Blog

**Backend**
- [ ] Crear modelo `BlogPost` (id, slug, title, excerpt, body, author, tags, created_at)
- [ ] Crear modelo `BlogAttachment` (id, post_id, file_name, file_path)
- [ ] Endpoint `GET /api/blog` — listar posts con paginación
- [ ] Endpoint `GET /api/blog/{slug}` — detalle de post con body renderizado (Jinja2)
- [ ] Endpoint `GET /api/blog/{slug}/attachment?name={input}` — servir adjunto por nombre, concatenando path sin sanitizar (V-014)
- [ ] Renderizar búsqueda del blog con template que interpola input (V-004 server-side rendering)

**Frontend**
- [ ] Página lista de blog: cards con thumbnail, título, excerpt, fecha, autor
- [ ] Página detalle de blog: body renderizado, autor, tags, adjuntos descargables
- [ ] Componente `BlogSearch` renderizado con Angular 1.7.x widget (V-004)
- [ ] Cargar Angular 1.7.7 como script independiente solo en blog

### F-011: Reviews System

**Backend**
- [ ] Endpoint `GET /api/reviews/{productId}` — listar reviews de un producto
- [ ] Endpoint `POST /api/reviews/{productId}` — crear review (rating, text)
- [ ] Endpoint `POST /api/reviews/{productId}/photos` — upload de fotos SIN validar extensión en backend (V-017)
- [ ] Guardar fotos en filesystem con nombre original (no sanitizado)
- [ ] Servir fotos estáticamente desde `/uploads/reviews/`
- [ ] Endpoint `DELETE /api/reviews/{id}` — borrar review SIN verificar ownership (V-028)
- [ ] Recalcular rating_avg del producto tras crear/borrar review

**Frontend**
- [ ] Componente `ReviewList` con reviews ordenadas por fecha
- [ ] Componente `ReviewCard` con nombre, rating (estrellas), texto, fotos, fecha
- [ ] Componente `ReviewForm` con selector de estrellas, textarea, file upload
- [ ] Componente `StarRating` reutilizable (display + input)
- [ ] Preview de fotos antes de subir

### F-012: The Swarm (Forum)

**Backend**
- [ ] Crear modelo `ForumThread` (id, user_id, category, title, body, created_at)
- [ ] Crear modelo `ForumReply` (id, thread_id, user_id, body, created_at)
- [ ] Endpoint `GET /api/forum/threads` — listar threads con paginación y filtro por categoría
- [ ] Endpoint `GET /api/forum/threads/{id}` — thread con replies paginadas
- [ ] Endpoint `POST /api/forum/threads` — crear thread
- [ ] Endpoint `POST /api/forum/threads/{id}/replies` — crear reply
- [ ] NO sanitizar HTML en body de threads ni replies (stored XSS deliberado)
- [ ] Categorías: General, Care Tips, Show & Tell, Bug Identification, Marketplace

**Frontend**
- [ ] Página lista de threads: tabs por categoría, cards con título, autor, fecha, reply count
- [ ] Página detalle de thread: post original + replies cronológicos
- [ ] Formulario crear thread: título + body (textarea con HTML)
- [ ] Formulario crear reply: body
- [ ] Paginación de replies

---

## Module 4: Admin Panel (Nest Admin)

### F-013: Admin Dashboard

**Backend**
- [ ] Endpoint `GET /api/admin/stats` — total users, orders, revenue, products in stock
- [ ] Endpoint `GET /api/admin/orders/recent` — últimos 10 pedidos
- [ ] Endpoint `GET /api/admin/products/top` — top 5 por ventas
- [ ] Endpoint `GET /api/admin/sales/chart` — datos de ventas últimos 30 días
- [ ] Todos accesibles sin verificación de role robusta (V-028)

**Frontend**
- [ ] Página dashboard con grid de stat cards (total users, orders, revenue, stock)
- [ ] Gráfico de ventas con Chart.js (line chart, 30 días)
- [ ] Tabla de últimos 10 pedidos con estado
- [ ] Lista top 5 productos más vendidos

### F-014: Product Management

**Backend**
- [ ] Endpoint `POST /api/admin/products` — crear producto
- [ ] Endpoint `PUT /api/admin/products/{id}` — editar producto
- [ ] Endpoint `DELETE /api/admin/products/{id}` — eliminar producto
- [ ] Endpoint `POST /api/admin/import/url` — importar productos desde URL externa con `requests.get(source_url)` sin restricción (V-015)
- [ ] Endpoint `POST /api/admin/import/xml` — importar productos desde XML con parser que permite DTDs (V-016)
- [ ] Endpoint `GET /api/admin/export?format=json|csv` — exportar catálogo
- [ ] Upload de fotos de productos

**Frontend**
- [ ] Tabla de productos con búsqueda, paginación, acciones (edit, delete)
- [ ] Modal/página de crear/editar producto con todos los campos
- [ ] Botón "Import from URL" con input de URL
- [ ] Botón "Import from XML" con file upload
- [ ] Botón "Export" con selector de formato

### F-015: User Management

**Backend**
- [ ] Endpoint `GET /api/admin/users` — listar usuarios con búsqueda y filtros, accesible sin auth check robusto (V-028)
- [ ] Endpoint `GET /api/admin/users/{id}` — detalle de usuario con pedidos y reviews
- [ ] Endpoint `PUT /api/admin/users/{id}/role` — cambiar rol
- [ ] Endpoint `PUT /api/admin/users/{id}/status` — activar/desactivar

**Frontend**
- [ ] Tabla de usuarios con búsqueda, filtro por rol, paginación
- [ ] Modal de detalle de usuario
- [ ] Dropdown para cambiar rol
- [ ] Toggle activar/desactivar

### F-016: Email Template System

**Backend**
- [ ] Almacenar templates predefinidos: Welcome, Order Confirmation, Shipping Update, Password Reset
- [ ] Endpoint `GET /api/admin/email-templates` — listar templates
- [ ] Endpoint `GET /api/admin/email-templates/{id}` — obtener template
- [ ] Endpoint `PUT /api/admin/email-templates/{id}` — actualizar template
- [ ] Endpoint `POST /api/admin/email-template/preview` — renderizar template con Jinja2 sin sandbox (V-027)
- [ ] Variables disponibles: `{{user.name}}`, `{{order.id}}`, `{{order.total}}`

**Frontend**
- [ ] Lista de templates con nombre y preview
- [ ] Editor de template (textarea o code editor simple)
- [ ] Panel de preview en vivo (renderiza al escribir)
- [ ] Lista de variables disponibles como referencia
- [ ] Botón "Preview" que llama al endpoint

### F-017: Health Check System

**Backend**
- [ ] Endpoint `POST /api/admin/healthcheck` — ejecutar health check
- [ ] Checks predefinidos: uptime, disk space, memory usage, DB connection
- [ ] Aceptar parámetro `cmd` para custom checks que ejecuta `os.popen(cmd)` (V-021 → RCE)
- [ ] Devolver output del comando como texto

**Frontend**
- [ ] Panel de health check con resultados tabulados
- [ ] Campo "Custom Check" con input de comando y botón "Run"
- [ ] Output formateado en `<pre>` block

---

## Module 5: API Layer

### F-018: REST API

**Backend**
- [ ] Configurar FastAPI con routers por módulo (auth, catalog, cart, orders, users, reviews, blog, forum, admin)
- [ ] Configurar CORS con `Access-Control-Allow-Origin: *` (V-008)
- [ ] Middleware de error handling: stack traces en Level 0, genéricos en Level 1+
- [ ] Middleware de auth: decodificar JWT del header Authorization
- [ ] No implementar CSRF protection (deliberado)
- [ ] Rate limiting: none (L0), 100/min (L1), 30/min (L2)
- [ ] Serialización JSON con FastAPI response models

**Frontend**
- [ ] API client centralizado con interceptors para auth (añadir Bearer token)
- [ ] Error handling global (mostrar toast en errores)
- [ ] Loading states en todas las llamadas API

### F-019: GraphQL API

**Backend**
- [ ] Instalar y configurar Strawberry/Graphene para FastAPI
- [ ] Definir schema: Query (products, product, users, user, orders, me)
- [ ] Definir schema: Mutation (updateUser, createReview, deleteProduct)
- [ ] Type `User` expone: id, email, name, role, orders, address (V-020: PII)
- [ ] Habilitar introspección (V-020)
- [ ] No limitar query depth (V-020: DoS)
- [ ] No verificar auth en mutations (V-020)
- [ ] Habilitar GraphQL Playground en `/api/graphql`

**Frontend**
- [ ] (Opcional) Componente que usa GraphQL para alguna consulta como demo

### F-020: Redirect Service

**Backend**
- [ ] Endpoint `GET /api/redirect?url={destination}`
- [ ] Insertar valor de `url` directamente en header `Location` sin validación (V-005)
- [ ] Aceptar cualquier scheme: http, https, javascript, data (V-006)
- [ ] Devolver HTTP 302 con Location header

---

## Module 6: Security Infrastructure

### F-021: WAF Layer (ModSecurity)

**DevOps**
- [ ] Crear Dockerfile para container ModSecurity con OWASP CRS v4
- [ ] Configurar ModSecurity como reverse proxy hacia frontend y backend
- [ ] Definir `docker-compose.waf.yml` override que reemplaza acceso directo
- [ ] Configurar Paranoia Level como env var (default: 2)
- [ ] Configurar logging de WAF a stdout para `docker compose logs`
- [ ] Crear custom exclusions para endpoints que deben funcionar
- [ ] Habilitar/deshabilitar via `BUGSTORE_WAF_ENABLED` env var

### F-022: Difficulty Level System

**Backend**
- [ ] Crear middleware `DifficultyMiddleware` que lee `BUGSTORE_DIFFICULTY` env var
- [ ] Level 0: no filtrar nada, error handler con stack traces
- [ ] Level 1: blacklist middleware que bloquea `<`, `>`, `'`, `"`, `;` en params seleccionados
- [ ] Level 1: error handler con mensajes genéricos
- [ ] Level 1: rate limiter 100 req/min por IP
- [ ] Level 1: añadir `X-Frame-Options: DENY` header
- [ ] Level 2: activar WAF, CSP strict header, HSTS header
- [ ] Level 2: rate limiter 30 req/min por IP
- [ ] Level 2: validación server-side adicional en inputs
- [ ] Asegurar que las 30 vulns siguen siendo explotables en todos los levels (con mayor dificultad)

### F-023: Cookie & Session Config

**Backend**
- [ ] Configurar session cookie `session_id` sin Secure, sin HttpOnly, sin SameSite (V-008)
- [ ] Crear middleware que genera cookie `TrackingId` con valor Base64
- [ ] Decodificar `TrackingId` e insertar en query SQL en middleware de tracking (V-013)
- [ ] Serializar preferencias de usuario con `pickle.dumps()` en cookie `user_prefs` (V-026)
- [ ] Deserializar `user_prefs` con `pickle.loads()` al cargar perfil (V-026)
- [ ] Cookie `category` que refleja el valor del param sin sanitizar

---

## Module 7: Data & Seeding

### F-024: Product Seed Data

- [ ] Crear `data/products.json` con 12 productos completos (datos del PRD sección 8)
- [ ] Cada producto: id, name, species, latin_name, description, personality, care_level, price, diet, habitat, lifespan, images[], category, stock, rating_avg, reviews_count
- [ ] Buscar/generar imágenes adorables de cada insecto (stock photos o AI generated)
- [ ] Distribuir en categorías: Beetles (3), Butterflies (2), Flying (2), Crawling (3), Exotic (2)
- [ ] Script seed que carga products.json en DB al inicializar

### F-025: User Seed Data

- [ ] Crear `data/users.json` con 4 usuarios
- [ ] admin: admin@bugstore.local / admin123 — MD5 hash: 0192023a7bbd73250516f069df18b500
- [ ] user1: john@bugstore.local / password123
- [ ] user2: jane@bugstore.local / ilovemantis
- [ ] staff: carlos@bugstore.local / staff2024
- [ ] Generar MD5 hashes sin salt para cada password
- [ ] Script seed que carga users.json en DB

### F-026: Blog Seed Data

- [ ] Crear `data/blog_posts.json` con 5 artículos
- [ ] Artículo 1: "5 Tips for First-Time Bug Owners"
- [ ] Artículo 2: "The Complete Beetle Care Guide"
- [ ] Artículo 3: "Why Mantises Make the Best Pets"
- [ ] Artículo 4: "Building Your First Ant Colony"
- [ ] Artículo 5: "Night Bugs: Caring for Fireflies and Luna Moths"
- [ ] Cada artículo con: slug, title, excerpt, body (markdown), author, tags, attachments
- [ ] Crear PDFs de guías de cuidado como adjuntos reales en filesystem
- [ ] Script seed que carga blog posts en DB

### F-027: Order & Review Seed Data

- [ ] Generar 8 pedidos distribuidos entre los 4 usuarios
- [ ] Cada pedido con: 1-3 items, estado variado, fechas distintas
- [ ] Generar 15 reviews distribuidas entre los 12 productos
- [ ] Cada review con: rating 1-5, texto realista, algunas con fotos
- [ ] Script seed que crea orders, order_items, reviews en DB
- [ ] Unificar todos los seeds en un solo `seed.py` ejecutable

---

## Module 8: Frontend UI

### F-028: Layout & Navigation

- [ ] Componente `Header` con logo, nav links (The Hive, Blog, The Swarm), icono cuenta, icono carrito con badge
- [ ] Componente `Footer` con links, copyright, disclaimer
- [ ] Componente `WarningBanner` fijo: "This is a deliberately vulnerable application. DO NOT deploy in production."
- [ ] Layout responsive mobile-first (breakpoints 640, 768, 1024, 1280)
- [ ] Componente `Sidebar` para categorías en catálogo
- [ ] Componente `Breadcrumbs` para navegación jerárquica
- [ ] React Router setup con todas las rutas

### F-029: Theme & Branding

- [ ] Configurar Tailwind con color palette: verde bosque (#2D5016), marrón tierra (#8B6914), beige claro (#F5F0E1)
- [ ] Importar fonts: Inter (body), Playfair Display (headings)
- [ ] Crear/buscar logo BugStore con mascota "Debuggy" (mariquita)
- [ ] Diseñar iconos de categorías de insectos
- [ ] Animaciones CSS: hover en product cards, transiciones de página
- [ ] Página 404 con "Debuggy" perdida
- [ ] (Bonus) Dark mode toggle con Tailwind dark variant

### F-030: Legacy Angular Widget

- [ ] Descargar Angular 1.7.7 minificado
- [ ] Crear widget "Trending Bugs" como app Angular separada
- [ ] Template del widget interpola input de usuario sin `$sce` (V-004)
- [ ] Montar widget en sidebar del blog con `ng-app` y `ng-controller`
- [ ] Asegurar que Angular solo se carga en la sección blog (no conflicta con React)

### F-031: Client-Side JavaScript

- [ ] Incluir jQuery 2.1.4 globalmente (V-030)
- [ ] Incluir Lodash 4.17.15 globalmente (V-030)
- [ ] Implementar función `deepMerge()` vulnerable a Prototype Pollution (V-007)
- [ ] Implementar hash fragment handler que usa `innerHTML` en `#category-title` (V-003)
- [ ] Crear `scanme.js` con event handlers de interacción
- [ ] Crear `subscribeNow.js` para newsletter form sin CSRF token

---

## Module 9: Infrastructure & DevOps

### F-032: Docker Compose Setup

- [ ] Crear `Dockerfile` para backend (Python 3.11 + FastAPI + uvicorn)
- [ ] Crear `Dockerfile` para frontend (Node 20 + Vite)
- [ ] Crear `docker-compose.yml` con 4 services: frontend, backend, postgres, redis
- [ ] Configurar networking entre containers
- [ ] Configurar volumes para DB persistence y file uploads
- [ ] Configurar health checks en cada container
- [ ] Crear `.env.example` con todas las variables
- [ ] Crear `docker-compose.waf.yml` override con container ModSecurity
- [ ] Script `entrypoint.sh` para backend que ejecuta migrations + seed + start
- [ ] Verificar que `docker compose up -d` funciona de cero en <2 minutos

### F-033: Database Schema

- [ ] Crear migration inicial con todas las tablas:
  - [ ] `users` (id, username, email, password_hash, name, bio, avatar_url, role, created_at, updated_at)
  - [ ] `products` (id, name, species, latin_name, description, personality, care_level, price, diet, habitat, lifespan, category, stock, rating_avg, reviews_count, created_at)
  - [ ] `product_images` (id, product_id, url, alt_text, sort_order)
  - [ ] `orders` (id, user_id, status, total, shipping_cost, tax, discount, shipping_address JSON, tracking_number, created_at, updated_at)
  - [ ] `order_items` (id, order_id, product_id, quantity, unit_price)
  - [ ] `reviews` (id, user_id, product_id, rating, text, created_at)
  - [ ] `review_photos` (id, review_id, file_path, original_name, mime_type)
  - [ ] `blog_posts` (id, slug, title, excerpt, body, author, tags JSON, created_at)
  - [ ] `blog_attachments` (id, post_id, file_name, file_path)
  - [ ] `cart_items` (id, session_id, product_id, quantity)
  - [ ] `coupons` (id, code, discount_percent, max_uses, current_uses, active)
  - [ ] `forum_threads` (id, user_id, category, title, body, created_at)
  - [ ] `forum_replies` (id, thread_id, user_id, body, created_at)
- [ ] Crear queries con concatenación de strings (NO ORM parameterizado) para endpoints vulnerables
- [ ] Usar ORM parameterizado para endpoints no vulnerables (para que la app funcione bien)
- [ ] Configurar PostgreSQL como DB principal + SQLite legacy endpoint como variante

### F-034: Logging & Monitoring

- [ ] Configurar logging middleware: method, path, status, response time, user-agent
- [ ] Log de WAF: capturar blocked requests con rule ID
- [ ] Error handler Level 0: devolver stack trace completo con paths
- [ ] Error handler Level 1+: devolver `{"error": "Something went wrong"}`
- [ ] Configurar log rotation: 7 días
- [ ] Asegurar logs accesibles via `docker compose logs`

---

## Module 10: Scoring & Benchmarking

### F-035: Vulnerability Verification Endpoint

**Backend**
- [ ] Endpoint `GET /api/debug/vulns` — solo activo en Level 0
- [ ] Listar las 30 vulnerabilidades con metadata: id, name, tier, status (planted/exploitable)
- [ ] Incluir PoC payload de ejemplo para cada vuln
- [ ] Incluir endpoint/param afectado para cada vuln
- [ ] Middleware que bloquea este endpoint en Level 1 y Level 2

### F-036: Scoring Dashboard

**Frontend**
- [ ] Página `/benchmark` con upload de resultados
- [ ] Parser de archivo JSON con resultados de escáner
- [ ] Matching engine: mapear findings a las 30 vulns por URL + param + vuln type
- [ ] Calcular puntuación: total, por tier (1, 2, 3), por categoría
- [ ] Gráfico radar: comparar 2 escáneres visualmente (Chart.js)
- [ ] Tabla de resultados detallada: vuln ID, nombre, tier, puntos, detectado?
- [ ] Export a PDF con resumen
- [ ] Export a JSON con datos crudos
- [ ] Tabla leaderboard: nombre escáner, puntuación, % por tier

### F-037: Scanner Result Importers

**Backend/Frontend**
- [ ] Importador Burp Suite: parsear XML export, extraer issues con URL + param + issue type
- [ ] Importador BugTraceAI: parsear JSON report, extraer findings
- [ ] Importador OWASP ZAP: parsear JSON/XML, extraer alerts
- [ ] Importador Nuclei: parsear JSON lines output, extraer template matches
- [ ] Importador genérico: formato JSON simple `{vuln_type, url, parameter, confidence}`
- [ ] Matching engine con fuzzy matching: normalizar URLs, mapear vuln types a IDs de BugStore
- [ ] Mapa de equivalencias: "SQL Injection" = "sqli" = "sql-injection" = V-001/V-012/V-013/V-019

---

## Module 11: Documentation

### F-038: User-Facing Docs

- [ ] README.md: qué es BugStore, screenshots, quick start, links a docs
- [ ] SETUP.md: requisitos (Docker, ports), instalación paso a paso, configuración avanzada, troubleshooting
- [ ] FAQ.md: preguntas frecuentes (es seguro?, puedo usarlo en CTF?, cómo cambiar dificultad?)

### F-039: Security Docs (Spoilers)

- [ ] VULNS.md con las 30 vulnerabilidades documentadas
- [ ] Cada vuln: descripción, ubicación exacta, PoC paso a paso, payload de ejemplo, impacto, remediación
- [ ] Organizar por tier con badge de dificultad
- [ ] Warning al inicio: "SPOILER ALERT — This document is for instructors and evaluators"
- [ ] Incluir tips de remediación para cada vuln (valor educativo)

### F-040: Benchmark Docs

- [ ] SCORING.md: explicación del sistema de puntuación, pesos, fórmula
- [ ] BENCHMARK-GUIDE.md: paso a paso para ejecutar benchmark completo
  - [ ] Paso 1: Deploy BugStore
  - [ ] Paso 2: Configurar escáner
  - [ ] Paso 3: Ejecutar scan
  - [ ] Paso 4: Exportar resultados
  - [ ] Paso 5: Importar en scoring dashboard
  - [ ] Paso 6: Comparar resultados
- [ ] RESULTS-TEMPLATE.md: template markdown para documentar resultados
- [ ] Tabla de resultados de referencia: Burp Pro vs BugTraceAI vs ZAP vs Nuclei

---

## Task Summary

| Module | Features | Tasks |
|--------|:--------:|:-----:|
| Core E-Commerce | 5 | 62 |
| User System | 4 | 42 |
| Content | 3 | 36 |
| Admin Panel | 5 | 37 |
| API Layer | 3 | 22 |
| Security Infra | 3 | 22 |
| Data & Seeding | 4 | 22 |
| Frontend UI | 4 | 24 |
| Infrastructure | 3 | 26 |
| Scoring | 3 | 22 |
| Documentation | 3 | 13 |
| **Total** | **40** | **328** |
