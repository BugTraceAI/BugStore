# BugStore - Feature List

## Detailed Feature Breakdown

---

## Module 1: Core E-Commerce Platform

### F-001: Product Catalog (The Hive)
- Grid layout with product cards (photo, name, species, price)
- Filter by category: Beetles, Butterflies, Arachnids, Flying, Crawling, Exotic
- Filter by price: min/max range with slider
- Filter by care level: Beginner, Intermediate, Expert
- Sort by: price, popularity, name, new arrivals
- Pagination: 12 products per page
- Free text search on name, species, and description
- "Bug of the Week" section highlighted on home
- "Bug Nursery" section for new arrivals (last 7 days)
- Each product shows: name, species (latin), personality, price, care level, average rating, photos

### F-002: Product Detail Page
- Bug photo gallery (3-5 images per product)
- Full information: name, species, long description, personality, lifespan, diet, habitat
- Price and "Add to Colony" button (add to cart)
- Quantity selector
- "Care Guide" section (embedded care guide)
- Availability badge: In Stock, Low Stock, Out of Stock
- Related products ("Bugs you might also love")
- Customer reviews section with rating (1-5 stars)
- Photo upload in reviews ("Show us your bug!")

### F-003: Shopping Cart
- Item display with thumbnail, name, quantity, unit price, subtotal
- Inline quantity modification (+ / -)
- Remove individual items
- "Empty Colony" button (empty cart)
- Subtotal, tax (8%), total
- Discount coupon field with "Apply" button
- Valid coupons: WELCOME10 (10%), BUGFAN20 (20%), FIRSTBUG (15%)
- Cart persistence in DB by session_id (JWT stateless, no Redis)
- Item counter visible in header (badge on cart icon)

### F-004: Checkout Flow
- Step 1: Shipping Info (name, address, city, zip code, country)
- Step 2: Payment (card number, expiration, CVV — simulated, not real)
- Step 3: Order Review (order summary, address, payment method)
- Step 4: Confirmation (order number, simulated confirmation email)
- Shipping calculation: Standard ($5.99), Express ($12.99), Free (orders >$100)
- Price summary: subtotal, discounts, shipping, tax, total
- Total is sent from frontend to backend (deliberate: V-023)
- No rate limiting on checkout endpoint (deliberate: V-025)

### F-005: Order Management
- "My Orders" view with user's order list
- Each order shows: ID, date, status (Pending, Processing, Shipped, Delivered), total
- Order detail: purchased items, shipping address, tracking number (simulated)
- Order status with visual timeline
- Direct endpoint by numeric ID without ownership verification (deliberate: V-009)

---

## Module 2: User System

### F-006: Registration
- Form: name, email, username, password, password confirmation
- Frontend validation: email format, password min 6 chars, alphanumeric username
- No backend validation for special chars in username (deliberate: V-019)
- Simulated welcome email (console log)
- Auto-login after registration (returns JWT)
- Default avatar based on name initial

### F-007: Authentication (JWT)
- Login with email/username + password
- JWT token in response body (not in HttpOnly cookie — deliberate: V-008)
- Token stored in localStorage (deliberate: accessible via XSS)
- JWT signed with HS256, weak secret: `bugstore_secret_2024` (deliberate: V-011)
- Backend accepts `alg: none` (deliberate: V-011)
- Does not validate `iss`, `aud`, `exp` with reasonable margin (deliberate)
- JWT payload includes: userId, email, role, name
- No refresh token — JWT lasts 24h
- Logout = delete token from localStorage (no server-side invalidation)

### F-008: User Profile (My Colony)
- View user data: name, email, username, avatar, registration date
- Edit profile: name, email, bio, avatar URL
- Change password (current + new + confirm)
- PUT endpoint accepts any field including `role` (deliberate: V-018)
- View order history
- View published reviews
- User preferences serialized in cookie with pickle (deliberate: V-026)
- Profile endpoint accessible by numeric userId without auth check (deliberate: V-010)

### F-009: User Roles
- 3 roles: `user`, `staff`, `admin`
- `user`: buy, create reviews, view profile and orders
- `staff`: all user actions + moderate reviews + view all orders
- `admin`: all staff actions + product management + import/export + user management + email templates + health checks
- Role embedded in JWT (not re-verified in backend for some endpoints — deliberate: V-028)

---

## Module 3: Content System

### F-010: Bug Blog
- Article list with thumbnail, title, excerpt, date, author
- Server-side rendered articles with Jinja2
- Search section rendered with legacy Angular 1.7.x widget (deliberate: V-004)
- Each article has: title, body (markdown rendered), author, date, tags, attachments
- Seed articles:
  - "5 Tips for First-Time Bug Owners"
  - "The Complete Beetle Care Guide"
  - "Why Mantises Make the Best Pets"
  - "Building Your First Ant Colony"
  - "Night Bugs: Caring for Fireflies and Luna Moths"
- Attachments downloadable by filename via query param (deliberate: V-014)

### F-011: Reviews System
- Rating 1-5 stars + review text
- Photo upload in review (up to 3 photos per review)
- File upload accepts any extension in backend (deliberate: V-017)
- Show reviewer name, rating, text, photos, date
- Average rating calculated and shown on product card
- Any user can delete any review via DELETE endpoint (deliberate: V-028)
- Reviews show reviewer username (which can contain SQLi if V-019 was exploited)

### F-012: The Swarm (Forum)
- Categories: General, Care Tips, Show & Tell, Bug Identification, Marketplace
- Thread list: title, author, date, number of replies
- Thread detail: original post + replies ordered chronologically
- Create thread: title + body
- Reply to thread: body
- No HTML sanitization in forum posts (deliberate: additional stored XSS)
- Pagination for threads and replies

---

## Module 4: Admin Panel (Nest Admin)

### F-013: Admin Dashboard
- General stats: total users, total orders, revenue, products in stock
- Sales chart last 30 days (Chart.js)
- Last 10 orders with status
- Top 5 best-selling products
- Accessible with normal user JWT if accessing endpoint directly (deliberate: V-028)

### F-014: Product Management
- Product CRUD: create, view, edit, delete
- Import from URL: `POST /api/admin/import/url` with body `{source_url}` (deliberate: V-015)
- Import from XML: `POST /api/admin/import/xml` with XML file upload (deliberate: V-016)
- Export to JSON/CSV
- Product photo management
- Editable categories

### F-015: User Management
- User list with search and filters
- View user detail: data, orders, reviews
- Change user role
- Deactivate/activate user
- Endpoint without robust auth check (deliberate: V-028)

### F-016: Email Template System
- Email template editor (for notifications)
- Live preview of rendered template
- Templates processed with Jinja2 without sandbox (deliberate: V-027)
- Predefined templates: Welcome, Order Confirmation, Shipping Update, Password Reset
- Available variables: `{{user.name}}`, `{{order.id}}`, `{{order.total}}`

### F-017: Health Check System
- Endpoint that executes system commands to verify server health
- Shows: uptime, disk space, memory usage, database status
- Accepts `cmd` parameter for custom checks (deliberate: V-021 chain → RCE)
- Only accessible as admin (but admin can be obtained via V-011 or V-021)

---

## Module 5: API Layer

### F-018: REST API
- All endpoints documented in section 9 of PRD
- Content-Type: `application/json`
- Auth: Bearer token JWT in Authorization header
- Errors in Level 0: full stack traces with internal paths
- Errors in Level 1+: generic messages (`{"error": "Something went wrong"}`)
- CORS: `Access-Control-Allow-Origin: *` (deliberate: V-008)
- No CSRF protection (deliberate)
- Rate limiting: none in Level 0, basic in Level 1, aggressive in Level 2

### F-019: GraphQL API
- Single endpoint: `POST /api/graphql`
- Introspection enabled (deliberate: V-020)
- No query depth limit (deliberate: V-020)
- Mutations without authorization verification (deliberate: V-020)
- Queries allow enumerating users and accessing other people's orders (deliberate: V-020)
- GraphQL Playground/GraphiQL enabled in development
- Schema exposes PII: email, address, role (deliberate)

### F-020: Redirect Service
- `GET /api/redirect?url={destination}`
- Used internally for click tracking in blog
- URL value inserted directly into Location header without validation (deliberate: V-005)
- Accepts any URL including javascript: and data: schemes (deliberate: V-006)

---

## Module 6: Security Infrastructure

### F-021: WAF Layer (Caddy + Coraza)
- Caddy as reverse proxy with coraza-waf plugin (OWASP CRS compatible) inside the same pod
- OWASP Core Rule Set (CRS) v4
- Active rules: SQL injection, XSS, LFI, RCE, protocol enforcement
- Configurable via `BUGSTORE_WAF_ENABLED` env var
- WAF logs accessible via stdout
- Configurable Paranoia Level (1-4) via `BUGSTORE_WAF_PARANOIA`
- Level 0/1: Caddy disabled, FastAPI serves directly on port 8080
- Level 2 (Hardened): Caddy+Coraza active by default, proxy to FastAPI

### F-022: Difficulty Level System
- Controlled by `BUGSTORE_DIFFICULTY` env var (0, 1, 2)
- Level 0: no filters, verbose errors, no rate limit, no WAF
- Level 1: basic char blacklist (`<`, `>`, `'`, `"`, `;` in some params), generic error messages, rate limit 100 req/min, partial headers (X-Frame-Options but no CSP)
- Level 2: WAF Caddy+Coraza active, strict CSP, rate limit 30 req/min, server+client validation, HSTS active
- Middleware that reads env var and applies corresponding filters
- All 3 levels maintain all 30 vulns — but increase exploitation difficulty

### F-023: Cookie & Session Config
- Session cookie `session_id`: no Secure flag, no HttpOnly, no SameSite (deliberate: V-008)
- Tracking cookie `TrackingId`: Base64 value, decoded and inserted in SQL query (deliberate: V-013)
- Preferences cookie `user_prefs`: serialized with pickle (deliberate: V-026)
- Category cookie: reflects param value without sanitization
- JWT stored in localStorage, not in HttpOnly cookie (deliberate)

---

## Module 7: Data & Seeding

### F-024: Product Seed Data
- 12 products (bugs as pets) with complete data
- Each product: id, name, species, latin_name, description, personality, care_level, price, diet, habitat, lifespan, images[], category, stock, rating_avg, reviews_count
- Categories: Beetles (3), Butterflies (2), Flying (2), Crawling (3), Exotic (2)
- Price range: $14.99 - $199.99
- Data stored in `data/products.json` — loaded into DB on initialization

### F-025: User Seed Data
- 4 predefined users with different roles
- admin: `admin@bugstore.local` / `admin123` (MD5 without salt — deliberate for V-021 chain)
- user1: `john@bugstore.local` / `password123`
- user2: `jane@bugstore.local` / `ilovemantis`
- staff: `carlos@bugstore.local` / `staff2024`
- Passwords hashed with MD5 without salt in DB (deliberate: easy to crack)
- Data stored in `data/users.json`

### F-026: Blog Seed Data
- 5 articles about insect care
- Each article: id, slug, title, excerpt, body (markdown), author, date, tags[], attachments[]
- Attachments: PDFs of care guides (real files in filesystem)
- Data stored in `data/blog_posts.json`

### F-027: Order & Review Seed Data
- 8 pre-generated orders distributed among the 4 users
- 15 pre-generated reviews with varied ratings (1-5 stars)
- Data generated upon running `seed.py` (auto-seed on first run if `BUGSTORE_AUTO_SEED=true`)

---

## Module 8: Frontend UI

### F-028: Layout & Navigation
- Header: BugStore logo, main navigation (The Hive, Blog, The Swarm), account icon, cart icon with badge
- Footer: links, copyright, security disclaimer
- Responsive: mobile-first (breakpoints 640, 768, 1024, 1280)
- Fixed top banner: "This is a deliberately vulnerable application. DO NOT deploy in production."
- Category sidebar in catalog
- Breadcrumbs in product detail and blog post

### F-029: Theme & Branding
- Color palette: forest green (#2D5016) primary, earth brown (#8B6914) secondary, light beige (#F5F0E1) background
- Typography: Inter for body, Playfair Display for headings
- "Debuggy" mascot (ladybug) in logo and 404 page
- Custom insect icons for categories
- Subtle animations: hover on product cards, page transitions
- Dark mode toggle (bonus — not vulnerable, just UX)

### F-030: Legacy Angular Widget
- "Trending Bugs" widget in blog sidebar
- Rendered with Angular 1.7.7 (deliberate: vulnerable version)
- Template interpolates user input without sanitization (deliberate: V-004)
- Loaded as independent script (`/resources/js/angular_1-7-7.js`)
- Only affects blog section, not the rest of the app (React)

### F-031: Client-Side JavaScript
- jQuery 2.1.4 loaded globally (deliberate: V-030)
- Lodash 4.17.15 loaded globally (deliberate: V-030)
- Custom `deepMerge()` function to parse URL filters (deliberate: V-007)
- Hash fragment handler using `innerHTML` (deliberate: V-003)
- `scanme.js` with event handlers for interaction
- `subscribeNow.js` for newsletter (CSRF vulnerable)

---

## Module 9: Infrastructure & DevOps

### F-032: Single Pod Deployment (fly.io)
- Single multi-stage `Dockerfile`: build frontend (Node 20 + Vite) → run backend (Python 3.11 + FastAPI)
- FastAPI serves static frontend + API + uploads from a single process
- Database configurable via `DATABASE_URL`: PostgreSQL (fly.io managed) or SQLite (local/dev)
- WAF via Caddy + coraza-waf plugin as reverse proxy inside the same container (Level 2)
- `fly.toml` with deploy config: region, mounts for `/data`, auto-scaling
- Volume `/data` for: SQLite DB, uploads, logs (persists between deploys)
- `.env` / `fly secrets` for all configuration
- Auto-seed on first run if DB is empty
- Health check endpoint `/api/health`
- Local development: `docker build && docker run` or `python main.py` directly

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
- Queries with direct string concatenation (deliberate: V-001, V-012, V-013, V-019)
- Passwords stored in MD5 without salt (deliberate: V-021 chain)

### F-034: Logging & Monitoring
- Request logging: method, path, status code, response time, user-agent
- WAF logs: blocked requests with rule ID and payload
- Error logs with stack traces (Level 0) or without (Level 1+)
- Log rotation: 7 days retention
- Accessible via `fly logs` or `docker logs bugstore`

---

## Module 10: Scoring & Benchmarking

### F-035: Vulnerability Verification Endpoint
- `GET /api/debug/vulns` (only accessible in Level 0)
- Lists all 30 vulnerabilities with status: planted, exploitable, verified
- Allows verifying each vuln works after deploy
- Includes example PoC payload for each
- Disabled in Level 1 and Level 2

### F-036: Scoring Dashboard
- Separate web page: `/benchmark`
- Input: JSON file with scanner results (generic format)
- Parses scanner findings and maps them to the 30 known vulns
- Calculates total score, by tier, and by vuln category
- Visual comparison: radar chart scanner A vs scanner B
- Export results to PDF/JSON
- Leaderboard table: scanner name, score, detection % by tier

### F-037: Scanner Result Importers
- Burp Suite Importer: parses Burp XML export
- BugTraceAI Importer: parses BTAI JSON report
- OWASP ZAP Importer: parses ZAP JSON/XML
- Nuclei Importer: parses Nuclei JSON output
- Generic Importer: JSON format with fields `{vuln_type, url, parameter, confidence}`
- Matching engine: maps scanner findings to BugStore's 30 vulns using fuzzy matching on URL + param + vuln type

---

## Module 11: Documentation

### F-038: User-Facing Docs
- README.md: quick start, screenshots, what is BugStore
- SETUP.md: requirements, step-by-step installation, advanced configuration
- FAQ.md: frequently asked questions

### F-039: Security Docs (Spoilers)
- VULNS.md: complete list of 30 vulnerabilities with exploitation walkthrough
- Organized by tier with difficulty rating
- Each vuln includes: description, location, PoC, impact, remediation
- Marked as SPOILER — for instructors and evaluators, not for students

### F-040: Benchmark Docs
- SCORING.md: scoring system explained
- BENCHMARK-GUIDE.md: how to run a full benchmark step-by-step
- RESULTS-TEMPLATE.md: template for documenting benchmark results
- Reference comparison: Burp Pro vs BugTraceAI vs ZAP (expected results)
