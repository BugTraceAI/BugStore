# BugStore Vulnerability Walkthrough

> **This is a hint-only guide.** You will never find complete exploit payloads, copy-pasteable attack strings, or step-by-step solutions here. The goal is to point you in the right direction so you can learn by doing.

## Before You Start

### Prerequisites

- BugStore running locally (see [README.md](README.md) for setup)
- A modern browser with DevTools (Chrome/Firefox recommended)
- `curl` or an HTTP client (Postman, Insomnia, Burp Suite)
- Basic knowledge of HTTP, HTML, and how web apps work
- Optional: `sqlmap`, `hashcat`, `jwt_tool`, Python 3

### Test Accounts

These accounts are created when the database is seeded:

| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | admin123 | admin | admin@bugstore.com |
| staff | staff123 | staff | staff@bugstore.com |
| user | user123 | user | user@bugstore.com |
| hacker_pro | 123456 | user | hacker@darkweb.com |
| admin2fa | admin2fa123 | admin | admin2fa@bugstore.com |

### Scoring

| Tier | Difficulty | Points per vuln |
|------|-----------|-----------------|
| 1 | Easy | 1 pt |
| 2 | Medium | 2 pts |
| 3 | Hard | 3 pts |

**Maximum score: 44 points** (11 + 24 + 9)

### How to Use This Guide

Each vulnerability has **3 progressive hints** hidden behind collapsible sections. Try to find the vulnerability on your own first. If you get stuck, open Hint 1. Still stuck? Open Hint 2. Hint 3 gets you very close but never gives you the answer.

> **Note:** 3 vulnerabilities from the original design (V-015: SSRF, V-016: XXE, V-017: Unrestricted File Upload) are not yet implemented. This guide covers the **26 active vulnerabilities**.

---

## Quick Reference

| ID | Name | Tier | OWASP | Target |
|----|------|------|-------|--------|
| V-001 | SQL Injection in Product Search | 1 | A03:2021 - Injection | `/api/products`, `/api/forum` |
| V-002 | Reflected XSS in Search | 1 | A03:2021 - Injection | Product catalog |
| V-003 | Stored XSS in Reviews | 1 | A03:2021 - Injection | `/api/reviews` |
| V-005 | Open Redirect | 1 | A01:2021 - Broken Access Control | `/api/redirect` |
| V-008 | Insecure Cookie Configuration | 1 | A05:2021 - Security Misconfiguration | All cookies |
| V-009 | IDOR in Orders | 1 | A01:2021 - Broken Access Control | `/api/orders` |
| V-010 | IDOR in User Profiles | 1 | A01:2021 - Broken Access Control | User data endpoints |
| V-014 | Path Traversal | 1 | A01:2021 - Broken Access Control | `/api/products/{id}/image` |
| V-019 | Improper Input Validation | 1 | A03:2021 - Injection | `/api/auth/register` |
| V-025 | No Rate Limiting | 1 | A05:2021 - Security Misconfiguration | All endpoints |
| V-030 | Vulnerable Components | 1 | A06:2021 - Vulnerable Components | Frontend libraries |
| V-004 | Client-Side Template Injection | 2 | A03:2021 - Injection | Blog page |
| V-006 | Weak Password Hashing (MD5) | 2 | A02:2021 - Cryptographic Failures | Authentication system |
| V-007 | Prototype Pollution | 2 | A08:2021 - Software Integrity Failures | Frontend catalog |
| V-011 | Weak JWT & Algorithm Confusion | 2 | A07:2021 - Identification Failures | JWT authentication |
| V-012 | Blind SQL Injection | 2 | A03:2021 - Injection | `/api/products` price filters |
| V-013 | SQL Injection via Cookie | 2 | A03:2021 - Injection | Root endpoint `/` |
| V-018 | Mass Assignment | 2 | A01:2021 - Broken Access Control | Review submission |
| V-020 | GraphQL Info Disclosure | 2 | A01:2021 - Broken Access Control | `/api/graphql` |
| V-023 | Price Manipulation | 2 | A04:2021 - Insecure Design | `/api/checkout` |
| V-028 | Broken Access Control (Admin) | 2 | A01:2021 - Broken Access Control | `/api/admin` |
| V-031 | TOTP Brute Force (No Rate Limit) | 2 | A07:2021 - Identification Failures | `/api/secure-portal/login` |
| V-032 | TOTP Secret Disclosure | 2 | A07:2021 - Identification Failures | `/api/secure-portal/login` |
| V-021 | RCE via Health Check | 3 | A03:2021 - Injection | `/api/health` |
| V-026 | Insecure Deserialization | 3 | A08:2021 - Software Integrity Failures | `/api/user/preferences` |
| V-027 | Server-Side Template Injection | 3 | A03:2021 - Injection | `/api/admin/email-preview` |

---

## Tier 1 - Easy (1 point each)

---

### V-001: SQL Injection in Product Search

| | |
|---|---|
| **OWASP** | A03:2021 - Injection |
| **Tier** | Easy (1 pt) |
| **Target** | `/api/products?search=...` and `/api/forum/threads` |
| **Tools** | Browser, curl, sqlmap |

The product catalog has a search feature. The forum also has search. Both build their database queries in an unsafe way.

<details>
<summary>Hint 1</summary>

Try typing special characters into the search box. What happens when you include characters that have meaning in database query languages?

</details>

<details>
<summary>Hint 2</summary>

The backend constructs its queries by directly inserting your search text into the SQL string. Think about what a single quote does in SQL syntax. Also look at the forum search endpoint -- it has the same pattern.

</details>

<details>
<summary>Hint 3</summary>

If you can break the query with a quote character and the application shows an error, you've confirmed the injection point. Now research UNION-based SQL injection to extract data from other tables. The database has a `users` table with interesting columns.

</details>

**What did you learn?** SQL injection occurs when user input is concatenated directly into SQL queries. The fix is always to use parameterized queries or an ORM with bound parameters.

---

### V-002: Reflected XSS in Search Results

| | |
|---|---|
| **OWASP** | A03:2021 - Injection |
| **Tier** | Easy (1 pt) |
| **Target** | Product catalog search UI |
| **Tools** | Browser DevTools |

When you search for products, the search term is displayed back to you on the page. But how is it displayed?

<details>
<summary>Hint 1</summary>

Search for something that looks like HTML. Does the page render it as text, or does the browser interpret it as actual HTML markup?

</details>

<details>
<summary>Hint 2</summary>

The frontend uses a React feature that bypasses its built-in XSS protection. Look at how the search results component renders the search term. The word "dangerously" might appear in the source code.

</details>

<details>
<summary>Hint 3</summary>

If the browser interprets your HTML, try using an image tag with an error handler. These execute JavaScript when the image fails to load. What could an attacker steal with JavaScript running in the user's browser?

</details>

**What did you learn?** Reflected XSS happens when user input is echoed back in the response without proper encoding. In React, `dangerouslySetInnerHTML` is the escape hatch that bypasses default protections.

---

### V-003: Stored XSS in Review Comments

| | |
|---|---|
| **OWASP** | A03:2021 - Injection |
| **Tier** | Easy (1 pt) |
| **Target** | Product review submission (`/api/reviews`) |
| **Tools** | Browser, curl |

Product reviews can include text comments. Are those comments sanitized before being stored and displayed to other users?

<details>
<summary>Hint 1</summary>

Submit a review on any product. Include some HTML in the comment text. After submitting, check if the HTML appears as rendered markup or as plain text when viewing the product.

</details>

<details>
<summary>Hint 2</summary>

The reviews component also uses the dangerous React feature that renders raw HTML. Whatever you write in your review comment is stored in the database exactly as-is, and then displayed to every user who views that product.

</details>

<details>
<summary>Hint 3</summary>

Unlike reflected XSS, this one is persistent -- your payload runs every time someone views the product page. Think about what happens when a site administrator views a product with a malicious review. Look at the seed data for an example of an XSS payload already planted in the database.

</details>

**What did you learn?** Stored XSS is more dangerous than reflected XSS because the payload persists and affects every user who views the page. Always sanitize user-generated content server-side.

---

### V-005: Open Redirect

| | |
|---|---|
| **OWASP** | A01:2021 - Broken Access Control |
| **Tier** | Easy (1 pt) |
| **Target** | `/api/redirect?url=...` |
| **Tools** | Browser, curl |

The application has a redirect endpoint. Its purpose is to redirect users to another URL. But does it validate where it sends you?

<details>
<summary>Hint 1</summary>

Try calling the redirect endpoint with a URL to an external domain. Does it redirect you there without any checks?

</details>

<details>
<summary>Hint 2</summary>

There is no whitelist of allowed domains and no validation of the URL scheme. The endpoint blindly redirects to whatever you pass. Think about how this could be used in a phishing campaign.

</details>

<details>
<summary>Hint 3</summary>

An attacker could craft a link like `http://bugstore.com/api/redirect?url=https://evil-site.com/fake-login` and send it to users. The link looks legitimate because it starts with the trusted domain. Could you also use other URL schemes besides http/https?

</details>

**What did you learn?** Open redirects allow attackers to abuse a trusted domain for phishing. The fix is to validate destination URLs against a whitelist of allowed domains.

---

### V-008: Insecure Cookie Configuration

| | |
|---|---|
| **OWASP** | A05:2021 - Security Misconfiguration |
| **Tier** | Easy (1 pt) |
| **Target** | All cookies set by the application |
| **Tools** | Browser DevTools (Application tab) |

Cookies carry sensitive data like session identifiers. The security of cookies depends heavily on the flags set when they are created.

<details>
<summary>Hint 1</summary>

Open your browser DevTools, go to the Application (or Storage) tab, and inspect the cookies. Look at the flags on each cookie: HttpOnly, Secure, SameSite.

</details>

<details>
<summary>Hint 2</summary>

If a cookie lacks the `HttpOnly` flag, it can be read by JavaScript in the browser. If it lacks `Secure`, it can be transmitted over unencrypted HTTP. If it lacks `SameSite`, it's vulnerable to Cross-Site Request Forgery.

</details>

<details>
<summary>Hint 3</summary>

Check the `user_prefs` cookie and any tracking cookies. None of them have proper security flags. Try accessing cookies from the browser console using `document.cookie`. If an XSS vulnerability exists (it does), an attacker could steal these cookies.

</details>

**What did you learn?** Cookies should always be set with `HttpOnly` (no JS access), `Secure` (HTTPS only), and `SameSite` (CSRF protection). Missing flags are a common misconfiguration.

---

### V-009: IDOR in Orders

| | |
|---|---|
| **OWASP** | A01:2021 - Broken Access Control |
| **Tier** | Easy (1 pt) |
| **Target** | `/api/orders/{id}` and `/api/orders/` |
| **Tools** | Browser, curl |

The orders endpoint lets you view order details. But does it check who is asking?

<details>
<summary>Hint 1</summary>

Log in as any user and access your orders. Then try changing the order ID in the URL to a different number. Can you see someone else's order?

</details>

<details>
<summary>Hint 2</summary>

The endpoint accepts an order ID and returns the full order details -- including shipping addresses and personal information -- without verifying that the order belongs to the requesting user. You don't even need to be logged in.

</details>

<details>
<summary>Hint 3</summary>

Try the list endpoint (`/api/orders/`) without any authentication. Also try passing `?user_id=1` or other user IDs. The API has no ownership checks at all. Enumerate order IDs starting from 1 to see all orders in the system.

</details>

**What did you learn?** Insecure Direct Object Reference (IDOR) happens when an application uses user-supplied input to access objects without checking authorization. Always verify that the requesting user owns the resource.

---

### V-010: IDOR in User Profiles

| | |
|---|---|
| **OWASP** | A01:2021 - Broken Access Control |
| **Tier** | Easy (1 pt) |
| **Target** | User data access points |
| **Tools** | curl, browser |

User profiles contain sensitive information like emails and roles. Can you access other users' data without authorization?

<details>
<summary>Hint 1</summary>

The REST API has a profile endpoint. But is there another API in the application that also exposes user data? Think about what technologies the app uses besides REST.

</details>

<details>
<summary>Hint 2</summary>

The application has more than one API paradigm. One of them is designed for flexible queries and it returns user data without requiring authentication. Look at the API routes registered in the main application.

</details>

<details>
<summary>Hint 3</summary>

There is a GraphQL endpoint. It exposes a `users` query that returns all users with their IDs, usernames, emails, and roles. No authentication is required. It also has a mutation that can modify user data for any user ID.

</details>

**What did you learn?** IDOR vulnerabilities can exist across multiple API surfaces. When an application has both REST and GraphQL endpoints, each needs its own authorization checks.

---

### V-014: Path Traversal

| | |
|---|---|
| **OWASP** | A01:2021 - Broken Access Control |
| **Tier** | Easy (1 pt) |
| **Target** | `/api/products/{id}/image?file=...` |
| **Tools** | curl, browser |

Product images are served through an API endpoint that takes a filename parameter. How is that filename used internally?

<details>
<summary>Hint 1</summary>

Look at how product images are loaded. The URL includes a `file` query parameter with the image filename. What happens if you change that filename?

</details>

<details>
<summary>Hint 2</summary>

The backend joins the `file` parameter directly to a directory path without sanitizing it. There are special character sequences that allow you to navigate up the directory tree.

</details>

<details>
<summary>Hint 3</summary>

Use dot-dot-slash sequences (`../`) in the `file` parameter to escape the images directory. Knowing that the application is Python-based (FastAPI), think about what interesting files you could read: application source code, configuration files, or even the database file itself.

</details>

**What did you learn?** Path traversal occurs when user input is used to construct file paths without sanitization. Always validate and sanitize file paths, and use `os.path.normpath()` with base directory checks.

---

### V-019: Improper Input Validation

| | |
|---|---|
| **OWASP** | A03:2021 - Injection |
| **Tier** | Easy (1 pt) |
| **Target** | `/api/auth/register` |
| **Tools** | curl, browser |

When creating a new account, the registration endpoint accepts a username. But are there any restrictions on what characters it accepts?

<details>
<summary>Hint 1</summary>

Try registering a user with unusual characters in the username: HTML tags, SQL syntax, or very long strings. Does the application reject any of them?

</details>

<details>
<summary>Hint 2</summary>

There is no server-side validation on the username field. It accepts HTML, SQL metacharacters, and any Unicode. This doesn't cause an immediate exploit by itself, but creates stored injection vectors.

</details>

<details>
<summary>Hint 3</summary>

Wherever the username is displayed later (forum posts, reviews, admin panel), the injected content might be rendered. Think of this as a secondary injection point -- the registration is the entry, but the impact happens elsewhere.

</details>

**What did you learn?** Input validation should happen at every entry point. Even if a field doesn't directly cause an exploit, storing unvalidated data creates risks wherever that data is later displayed or processed.

---

### V-025: No Rate Limiting

| | |
|---|---|
| **OWASP** | A05:2021 - Security Misconfiguration |
| **Tier** | Easy (1 pt) |
| **Target** | All endpoints (Level 0) |
| **Tools** | curl, Burp Suite Intruder |

How many requests can you send per second to the login endpoint? Is there any limit?

<details>
<summary>Hint 1</summary>

Try sending multiple rapid requests to the login endpoint with different passwords. Does the application ever slow you down or block you?

</details>

<details>
<summary>Hint 2</summary>

In difficulty Level 0, there is absolutely no rate limiting. You can send thousands of requests per minute without any throttling. This makes brute-force attacks trivial.

</details>

<details>
<summary>Hint 3</summary>

The login endpoint returns different responses for valid vs. invalid credentials, which allows account enumeration. Combined with no rate limiting, an attacker could run a dictionary attack. Try using a list of common passwords against known email addresses.

</details>

**What did you learn?** Rate limiting is essential for protecting authentication endpoints. Without it, brute-force attacks, credential stuffing, and denial of service become trivial.

---

### V-030: Using Vulnerable Components

| | |
|---|---|
| **OWASP** | A06:2021 - Vulnerable and Outdated Components |
| **Tier** | Easy (1 pt) |
| **Target** | Frontend JavaScript libraries |
| **Tools** | Browser (View Source), npm audit, retire.js |

Modern web applications rely on third-party libraries. Are all the libraries used in BugStore up to date?

<details>
<summary>Hint 1</summary>

View the page source or inspect the loaded JavaScript files. Look for version numbers in library comments or filenames. Check the `legacy/` directory in particular.

</details>

<details>
<summary>Hint 2</summary>

The application includes some legacy JavaScript libraries that are several years old. Look for jQuery, Lodash, and AngularJS. Each of these old versions has known CVEs (Common Vulnerabilities and Exposures).

</details>

<details>
<summary>Hint 3</summary>

Specifically look for: jQuery 2.1.4 (CVE-2015-9251), Lodash 4.17.15 (CVE-2019-10744 -- prototype pollution), and Angular 1.7.7 (CVE-2020-7676). Cross-reference the versions you find against the NVD (National Vulnerability Database) or use tools like `retire.js` for automated detection.

</details>

**What did you learn?** Always keep dependencies up to date and regularly audit them. Tools like `npm audit`, `retire.js`, and Dependabot can automatically flag known vulnerabilities in your dependencies.

---

## Tier 2 - Medium (2 points each)

---

### V-004: Client-Side Template Injection (Angular)

| | |
|---|---|
| **OWASP** | A03:2021 - Injection |
| **Tier** | Medium (2 pts) |
| **Target** | Blog page |
| **Tools** | Browser |

The blog page has a legacy widget built with an older JavaScript framework. It accepts input through a URL parameter.

<details>
<summary>Hint 1</summary>

Visit the blog page and look at the HTML source. There's a legacy sidebar widget powered by a well-known JavaScript framework. This widget reads a parameter from the URL.

</details>

<details>
<summary>Hint 2</summary>

The widget is built with AngularJS 1.x. It reads a `legacy_q` parameter from the URL and renders it using `trustAsHtml`. AngularJS 1.x has its own template expression syntax using double curly braces.

</details>

<details>
<summary>Hint 3</summary>

AngularJS expressions inside double curly braces are evaluated in the Angular context. In older versions (before the sandbox was properly secured), you could escape the sandbox to execute arbitrary JavaScript. Research "AngularJS sandbox escape" for version 1.7.x.

</details>

**What did you learn?** Client-side template injection occurs when frameworks evaluate user-controlled expressions. Legacy JavaScript frameworks are especially dangerous because their sandboxing mechanisms were often bypassed.

---

### V-006: Weak Password Hashing (MD5)

| | |
|---|---|
| **OWASP** | A02:2021 - Cryptographic Failures |
| **Tier** | Medium (2 pts) |
| **Target** | User authentication system |
| **Tools** | hashcat, john, CrackStation |

The application stores user passwords as hashes. But not all hash algorithms are created equal.

<details>
<summary>Hint 1</summary>

If you can extract data from the database (via other vulnerabilities), look at the password hashes. What format are they in? How long are they? Do they have a salt prepended or appended?

</details>

<details>
<summary>Hint 2</summary>

The hashes are 32 hexadecimal characters long and have no salt. This is a very well-known hashing algorithm that is considered completely broken for password storage. Entire databases of pre-computed hashes exist online.

</details>

<details>
<summary>Hint 3</summary>

The application uses MD5 without any salt. You can identify MD5 hashes by their 32-character hex length. Try pasting the hash into an online database like CrackStation, or use hashcat with mode 0 and a common wordlist like rockyou.txt.

</details>

**What did you learn?** MD5 is not suitable for password hashing. It's fast (which is bad for passwords), has no built-in salt, and billions of pre-computed hashes exist. Use bcrypt, scrypt, or Argon2 for password storage.

---

### V-007: Prototype Pollution

| | |
|---|---|
| **OWASP** | A08:2021 - Software Integrity Failures |
| **Tier** | Medium (2 pts) |
| **Target** | Frontend product catalog |
| **Tools** | Browser DevTools |

The product catalog accepts filter parameters from the URL. Those parameters are parsed and merged into objects on the frontend.

<details>
<summary>Hint 1</summary>

Look at the URL parameters accepted by the catalog page. There's a `filter` parameter that accepts JSON. Find the JavaScript code that processes this filter.

</details>

<details>
<summary>Hint 2</summary>

The frontend has a `deepMerge()` function that recursively merges objects. It doesn't protect against special JavaScript property names that can modify the prototype chain of all objects.

</details>

<details>
<summary>Hint 3</summary>

In JavaScript, every object inherits from `Object.prototype`. If you can set a property on `__proto__`, it becomes available on ALL objects in the application. Think about what properties the application checks for authorization (like `isAdmin`) and try setting them through the prototype chain via the filter parameter.

</details>

**What did you learn?** Prototype pollution is a JavaScript-specific vulnerability where an attacker modifies `Object.prototype`, affecting all objects. Always filter out keys like `__proto__`, `constructor`, and `prototype` when merging user-controlled objects.

---

### V-011: Weak JWT Secret & Algorithm Confusion

| | |
|---|---|
| **OWASP** | A07:2021 - Identification and Authentication Failures |
| **Tier** | Medium (2 pts) |
| **Target** | JWT authentication tokens |
| **Tools** | jwt.io, jwt_tool, Python |

The application uses JSON Web Tokens (JWT) for authentication. But the security of a JWT depends on its secret and the algorithms it accepts.

<details>
<summary>Hint 1</summary>

After logging in, look at your authentication token. It's a JWT -- you can decode it at jwt.io without knowing the secret. Examine the header and payload. What algorithm is being used?

</details>

<details>
<summary>Hint 2</summary>

The signing secret is not cryptographically random -- it's a guessable string related to the application name and year. Tools like `jwt_tool` can brute-force weak secrets. Also look at what algorithms the server accepts during verification.

</details>

<details>
<summary>Hint 3</summary>

The server accepts the `"none"` algorithm during token verification, which means unsigned tokens might be accepted. Also, the secret follows a predictable pattern: think application name + underscore + keyword + underscore + year. If you can forge a token with `"role": "admin"`, you gain admin access.

</details>

**What did you learn?** JWT security depends on: (1) strong, random secrets (32+ bytes), (2) strict algorithm validation (never accept `"none"`), and (3) proper claims verification. Weak JWTs are equivalent to no authentication.

---

### V-012: Blind SQL Injection

| | |
|---|---|
| **OWASP** | A03:2021 - Injection |
| **Tier** | Medium (2 pts) |
| **Target** | `/api/products?min_price=...&max_price=...` |
| **Tools** | curl, sqlmap, Python |

The product catalog has price filters. Unlike the search field (V-001), these don't return visible SQL errors. But are they safe?

<details>
<summary>Hint 1</summary>

The price filter parameters expect numeric values, but what happens if you send non-numeric SQL syntax? The results won't show a direct error in the response, but the behavior might change.

</details>

<details>
<summary>Hint 2</summary>

This is a blind SQL injection -- the results don't contain the extracted data directly. Instead, you need to infer information based on the application's behavior: does the response change based on a true/false condition? Or does the response time change?

</details>

<details>
<summary>Hint 3</summary>

Try conditional expressions in the price parameter. You can use database-specific functions to introduce delays when a condition is true (time-based blind injection). Extract data one character at a time by checking conditions against the database content. Tools like `sqlmap` can automate this process.

</details>

**What did you learn?** Blind SQL injection is harder to exploit but just as dangerous as visible SQL injection. The fix is the same: parameterized queries. Automated tools like sqlmap can detect and exploit blind injection points efficiently.

---

### V-013: SQL Injection via Cookie

| | |
|---|---|
| **OWASP** | A03:2021 - Injection |
| **Tier** | Medium (2 pts) |
| **Target** | Root endpoint (`/`), TrackingId cookie |
| **Tools** | Browser DevTools, curl, Burp Suite |

Not all injection points are in URL parameters or form fields. Sometimes they hide in HTTP headers or cookies.

<details>
<summary>Hint 1</summary>

When you visit the application's root URL, a cookie is automatically set in your browser. Inspect your cookies and find one that looks encoded (not plain text). What encoding is it using?

</details>

<details>
<summary>Hint 2</summary>

The `TrackingId` cookie is Base64-encoded. When the server receives it, it decodes the value and uses it in a SQL query. The query runs silently in the background -- you won't see errors, but the injection point is real.

</details>

<details>
<summary>Hint 3</summary>

Craft your own value, encode it in Base64, and set it as the `TrackingId` cookie. The decoded value is inserted into a SQL query that searches the `products` table. Since the query result isn't shown to you, this is another blind injection point -- use time-based techniques or observe behavioral differences.

</details>

**What did you learn?** SQL injection can occur through any user-controlled input, including cookies, HTTP headers, and other unexpected channels. Never trust any data from the client, regardless of how it arrives.

---

### V-018: Mass Assignment

| | |
|---|---|
| **OWASP** | A01:2021 - Broken Access Control |
| **Tier** | Medium (2 pts) |
| **Target** | Review submission (`/api/reviews`) |
| **Tools** | curl, Burp Suite |

When submitting data to an API, what happens if you include extra fields that the form doesn't normally send?

<details>
<summary>Hint 1</summary>

The review submission form only shows fields for rating and comment. But what fields does the API actually accept? Try sending additional JSON keys in your POST request that aren't part of the normal form.

</details>

<details>
<summary>Hint 2</summary>

The review API model defines a field that controls whether a review is published immediately or requires moderation. The frontend doesn't expose this field, but the backend accepts it if you include it in your request.

</details>

<details>
<summary>Hint 3</summary>

When submitting a review, add `"is_approved": true` to your JSON payload. The backend blindly trusts this field, allowing you to bypass the review moderation system. Think about what other API endpoints might accept unexpected fields -- the profile endpoint is worth investigating too.

</details>

**What did you learn?** Mass assignment occurs when an API binds request data directly to internal objects without filtering. Always explicitly whitelist which fields can be updated by users.

---

### V-020: GraphQL Information Disclosure & IDOR

| | |
|---|---|
| **OWASP** | A01:2021 - Broken Access Control |
| **Tier** | Medium (2 pts) |
| **Target** | `/api/graphql` |
| **Tools** | Browser, curl, GraphQL Playground |

The application has a GraphQL API alongside its REST API. GraphQL is powerful, but it requires careful access control.

<details>
<summary>Hint 1</summary>

Visit the GraphQL endpoint in your browser. Many GraphQL implementations include an interactive explorer (GraphiQL). If available, use it to discover what queries and mutations are available. If not, try sending an introspection query.

</details>

<details>
<summary>Hint 2</summary>

The GraphQL resolvers have no authentication checks at all. Any query or mutation can be executed by anyone. Try querying for all users or all orders -- you'll get complete results including sensitive fields like emails and roles.

</details>

<details>
<summary>Hint 3</summary>

Beyond reading data, look at the available mutations. There's a mutation that can modify user data for any user ID. You can change any user's profile information without being logged in. This is an IDOR vulnerability through the GraphQL API.

</details>

**What did you learn?** GraphQL APIs need the same access control as REST APIs. Every resolver should check authentication and authorization. Introspection should be disabled in production. Think of each resolver as an API endpoint that needs protection.

---

### V-023: Price Manipulation (Trusted Client)

| | |
|---|---|
| **OWASP** | A04:2021 - Insecure Design |
| **Tier** | Medium (2 pts) |
| **Target** | `/api/checkout/process` |
| **Tools** | Browser DevTools (Network tab), curl, Burp Suite |

The checkout process involves calculating a total price and submitting the order. But who calculates the total?

<details>
<summary>Hint 1</summary>

Add some items to your cart and proceed to checkout. Open the Network tab in DevTools and intercept the checkout request. Examine the JSON payload being sent to the server. Is there a `total` field?

</details>

<details>
<summary>Hint 2</summary>

The frontend calculates the total and sends it to the backend in the checkout request. The backend uses this client-provided total directly when creating the order, instead of calculating it from the cart items on the server side.

</details>

<details>
<summary>Hint 3</summary>

Intercept the checkout request and modify the `total` field to a much smaller amount (like 0.01). The server will happily create the order with your modified total. This is a classic "trusted client" vulnerability where business logic is implemented only on the client side.

</details>

**What did you learn?** Never trust client-side calculations for security-sensitive operations. Prices, totals, discounts, and any business-critical values must be calculated and validated on the server.

---

### V-028: Broken Access Control (Admin Endpoints)

| | |
|---|---|
| **OWASP** | A01:2021 - Broken Access Control |
| **Tier** | Medium (2 pts) |
| **Target** | `/api/admin/*` |
| **Tools** | curl, browser |

The admin area has several endpoints. Are all of them properly protected?

<details>
<summary>Hint 1</summary>

Most admin endpoints require authentication and role verification. But developers sometimes forget to protect debug or diagnostic endpoints. Try discovering admin paths beyond the ones visible in the UI.

</details>

<details>
<summary>Hint 2</summary>

There's a debug endpoint under the admin prefix that doesn't have any authentication middleware. It returns sensitive information including email addresses. The endpoint name is descriptive -- it tells you it's vulnerable right in its URL.

</details>

<details>
<summary>Hint 3</summary>

Try accessing `/api/admin/vulnerable-debug-stats` without any authentication token. It returns admin email addresses and internal statistics. Compare it with other admin endpoints like `/api/admin/stats` which properly requires authentication. This is a common pattern: debug endpoints left unprotected in production.

</details>

**What did you learn?** Access control must be consistent across ALL endpoints. Debug and diagnostic endpoints are frequently forgotten during security reviews. In production, they should either be removed entirely or protected with the same authentication as other admin endpoints.

---

### V-031: TOTP Brute Force (No Rate Limiting)

| | |
|---|---|
| **OWASP** | A07:2021 - Identification and Authentication Failures |
| **Tier** | Medium (2 pts) |
| **Target** | `/api/secure-portal/login` |
| **Tools** | curl, Python, Burp Suite Intruder |

The Secure Portal requires two-factor authentication. But how robust is the verification mechanism?

<details>
<summary>Hint 1</summary>

The Secure Portal login at `/secure-portal/login` requires a username, password, AND a 6-digit TOTP code. Try submitting invalid codes. Does anything stop you from trying again immediately?

</details>

<details>
<summary>Hint 2</summary>

There is no rate limiting, no account lockout, and no delay between attempts on the TOTP verification. A 6-digit code has only 1,000,000 possible values (000000-999999). TOTP codes are valid for 30 seconds.

</details>

<details>
<summary>Hint 3</summary>

With no rate limiting, an attacker who knows the username and password can brute-force all possible TOTP codes within the 30-second validity window. The endpoint responds instantly to each attempt, making this feasible even with simple scripting tools. Compare this with V-025 (no rate limiting on regular login).

</details>

**What did you learn?** Two-factor authentication is only as strong as its weakest link. Without rate limiting, a 6-digit TOTP code can be brute-forced trivially. Always implement rate limiting and account lockout on 2FA verification endpoints.

---

### V-032: TOTP Secret Disclosure in Login Response

| | |
|---|---|
| **OWASP** | A07:2021 - Identification and Authentication Failures |
| **Tier** | Medium (2 pts) |
| **Target** | `/api/secure-portal/login` |
| **Tools** | Browser DevTools (Network tab), curl |

When you successfully log in to the Secure Portal, examine the response carefully. Is there information that shouldn't be there?

<details>
<summary>Hint 1</summary>

After a successful login to the Secure Portal, open the Network tab in DevTools and inspect the JSON response body. Look at all the fields returned, especially in the `user` object.

</details>

<details>
<summary>Hint 2</summary>

The login response includes a field that contains cryptographic material used to generate TOTP codes. This secret should never leave the server after the initial setup process. If an attacker captures this value, they can generate valid TOTP codes forever.

</details>

<details>
<summary>Hint 3</summary>

The `totp_secret` field is included in the login response's `user` object. With this Base32-encoded secret, anyone can use a TOTP library (like `pyotp` in Python) to generate valid 6-digit codes at any time, completely bypassing 2FA even after the user changes their password.

</details>

**What did you learn?** API responses should never include sensitive cryptographic secrets. The TOTP secret should only be displayed once during the initial 2FA setup. Leaking it in subsequent responses creates a permanent bypass for the second authentication factor.

---

## Tier 3 - Hard (3 points each)

---

### V-021: Remote Code Execution via Health Check

| | |
|---|---|
| **OWASP** | A03:2021 - Injection |
| **Tier** | Hard (3 pts) |
| **Target** | `/api/health` |
| **Tools** | curl (with admin token) |

The health check endpoint seems innocent. But does it accept any parameters?

<details>
<summary>Hint 1</summary>

Visit the health endpoint normally -- it returns system status. Now look at what query parameters it accepts. There's an optional parameter that's not documented in the UI. You'll need admin access to use it.

</details>

<details>
<summary>Hint 2</summary>

The endpoint has a `cmd` parameter that is only accessible with admin privileges. If you've already obtained admin access through other vulnerabilities (V-011, V-018, or the attack chain V-001 -> V-006), you can use this parameter. The parameter value is passed to a system function.

</details>

<details>
<summary>Hint 3</summary>

The `cmd` parameter value is passed directly to Python's `subprocess` with `shell=True`. This means the server executes whatever system command you send. This is full Remote Code Execution -- the most critical vulnerability class. First, chain other vulnerabilities to get admin access, then use this endpoint.

</details>

**What did you learn?** RCE (Remote Code Execution) is the highest-severity vulnerability. Never pass user input to system commands. Use safe APIs instead of shell execution, and always validate input against an allowlist. This vulnerability also demonstrates how attack chains work: you need admin access first.

---

### V-026: Insecure Deserialization (Pickle)

| | |
|---|---|
| **OWASP** | A08:2021 - Software and Data Integrity Failures |
| **Tier** | Hard (3 pts) |
| **Target** | `/api/user/preferences` |
| **Tools** | Python, curl |

The user preferences system uses cookies to store and retrieve settings. But how are those settings serialized?

<details>
<summary>Hint 1</summary>

Set your preferences through the API, then inspect the `user_prefs` cookie. It's encoded in Base64. Decode it -- what format is the data in? It's not JSON.

</details>

<details>
<summary>Hint 2</summary>

The application uses Python's `pickle` module to serialize and deserialize preferences. Pickle is a powerful serialization format that can represent arbitrary Python objects. When the server reads the cookie, it deserializes whatever is in it using `pickle.loads()`.

</details>

<details>
<summary>Hint 3</summary>

Python pickle deserialization can execute arbitrary code during the unpickling process. The `__reduce__` method on a class defines what code runs during deserialization. You need to craft a Python object, serialize it with pickle, Base64-encode it, and set it as the `user_prefs` cookie. When the server reads the cookie, your code executes.

</details>

**What did you learn?** Never deserialize untrusted data with unsafe formats like Python pickle, Java serialization, or PHP unserialize. These formats allow code execution during deserialization. Always use safe, data-only formats like JSON.

---

### V-027: Server-Side Template Injection (SSTI)

| | |
|---|---|
| **OWASP** | A03:2021 - Injection |
| **Tier** | Hard (3 pts) |
| **Target** | `/api/admin/email-preview` |
| **Tools** | curl (with admin token) |

The admin panel has an email template preview feature. Templates use a rendering engine to generate dynamic content. What happens when user input is treated as a template?

<details>
<summary>Hint 1</summary>

The email preview endpoint accepts a template body and renders it. This is meant for previewing email templates with variables like `{{ user.name }}`. But what happens if you send other types of template expressions?

</details>

<details>
<summary>Hint 2</summary>

The application uses Jinja2 for template rendering, without sandboxing. Jinja2 expressions can access Python objects and their attributes. If you can navigate the object hierarchy, you can reach dangerous functions. Research "Jinja2 SSTI" for techniques.

</details>

<details>
<summary>Hint 3</summary>

In Jinja2, you can traverse the class hierarchy of Python objects using `__class__`, `__init__`, `__globals__`, and other dunder attributes. The goal is to reach a module like `os` or `subprocess` to execute system commands. This is essentially RCE through the template engine. You need admin access first, which you can obtain through other vulnerabilities.

</details>

**What did you learn?** Server-Side Template Injection is extremely dangerous because it often leads to RCE. Never render user input as a template. If you must allow template customization, use a sandboxed rendering environment and restrict available functions.

---

## Bonus: Attack Chains

Individual vulnerabilities are dangerous, but the real power comes from chaining them together. Here are three attack chains to explore.

### Chain 1: Guest to Admin to RCE

Starting as an unauthenticated user, can you get full system access?

<details>
<summary>Direction</summary>

Start by extracting credential data from the database (Tier 1). Then break the cryptographic protection on those credentials (Tier 2). Once you have admin access, look for endpoints that interact with the operating system (Tier 3).

</details>

### Chain 2: User to Admin Without Database Attacks

Can you escalate privileges without using SQL injection?

<details>
<summary>Direction</summary>

Think about APIs that accept extra fields they shouldn't (Tier 2), or authentication mechanisms with exploitable weaknesses (Tier 2). Once you have admin access, the template system awaits (Tier 3).

</details>

### Chain 3: XSS to Account Takeover

Can a stored payload in a review lead to complete session hijacking?

<details>
<summary>Direction</summary>

A persistent payload (Tier 1) combined with insecure cookie settings (Tier 1) means that when a privileged user views the infected page, their session can be stolen. Use the stolen session for any admin action.

</details>

---

## Glossary

| Term | Definition |
|------|-----------|
| **SQLi** | SQL Injection -- inserting SQL code through user input |
| **XSS** | Cross-Site Scripting -- injecting client-side scripts into web pages |
| **IDOR** | Insecure Direct Object Reference -- accessing objects without authorization |
| **SSTI** | Server-Side Template Injection -- injecting code into server-side templates |
| **RCE** | Remote Code Execution -- executing arbitrary commands on the server |
| **CSRF** | Cross-Site Request Forgery -- tricking users into performing unintended actions |
| **JWT** | JSON Web Token -- a compact token format for authentication |
| **OWASP** | Open Web Application Security Project -- a security standards organization |
| **CVE** | Common Vulnerabilities and Exposures -- a standardized vulnerability identifier |

## Resources

- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [HackTricks](https://book.hacktricks.xyz/)
- [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [CrackStation (Hash Lookup)](https://crackstation.net/)
- [jwt.io (JWT Debugger)](https://jwt.io/)
- [BugTraceAI Documentation](https://github.com/BugTraceAI/BugTraceAI/wiki)

---

*Built with purpose by [BugTraceAI](https://bugtraceai.com). Happy hunting.*
