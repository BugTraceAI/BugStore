from fastapi import APIRouter, Depends
from src.auth import get_current_user_optional
from src.models import User
import os

router = APIRouter(prefix="/debug", tags=["debug"])

def _scoring_enabled():
    return os.getenv("BUGSTORE_SCORING_ENABLED", "true").lower() in ("true", "1", "yes")

def _difficulty_level():
    return int(os.getenv("BUGSTORE_DIFFICULTY", "0"))

@router.get("/vulns")
async def list_vulnerabilities(user: User = Depends(get_current_user_optional)):
    """
    Lists all 30 vulnerabilities with status and example PoC.
    Only accessible when scoring is enabled and difficulty is Level 0.
    """
    if not _scoring_enabled():
        return {"error": "Scoring is disabled on this instance"}

    if _difficulty_level() > 0:
        return {"error": "Debug endpoints disabled in this difficulty level"}
    
    vulnerabilities = [
        {
            "id": "V-001",
            "name": "SQL Injection in Product Search",
            "tier": 1,
            "location": "/api/products?search=...",
            "status": "planted",
            "poc": "/api/products?search=test' OR '1'='1",
            "impact": "Database enumeration via information_schema, data exfiltration"
        },
        {
            "id": "V-002",
            "name": "Reflected XSS in Search Results",
            "tier": 1,
            "location": "/products (frontend)",
            "status": "planted",
            "poc": "Search for: <script>alert('XSS')</script>",
            "impact": "Session hijacking, credential theft"
        },
        {
            "id": "V-003",
            "name": "Stored XSS in Review Comments",
            "tier": 1,
            "location": "/api/reviews",
            "status": "planted",
            "poc": "Submit review with: <img src=x onerror=alert('XSS')>",
            "impact": "Persistent XSS affecting all users"
        },
        {
            "id": "V-004",
            "name": "Client-Side Template Injection (Angular)",
            "tier": 2,
            "location": "/blog (legacy widget)",
            "status": "planted",
            "poc": "?legacy_q={{constructor.constructor('alert(1)')()}}",
            "impact": "Code execution in browser context"
        },
        {
            "id": "V-005",
            "name": "Open Redirect",
            "tier": 1,
            "location": "/api/redirect",
            "status": "planted",
            "poc": "/api/redirect?url=https://evil.com",
            "impact": "Phishing attacks"
        },
        {
            "id": "V-006",
            "name": "Weak Password Hashing (MD5)",
            "tier": 2,
            "location": "User model",
            "status": "planted",
            "poc": "Crack password hashes from DB",
            "impact": "Account takeover via hash cracking"
        },
        {
            "id": "V-007",
            "name": "Prototype Pollution",
            "tier": 2,
            "location": "/products (frontend deepMerge)",
            "status": "planted",
            "poc": "?filter={\"__proto__\":{\"isAdmin\":true}}",
            "impact": "Client-side privilege escalation"
        },
        {
            "id": "V-008",
            "name": "Insecure Cookie Configuration",
            "tier": 1,
            "location": "Cookie settings",
            "status": "planted",
            "poc": "Inspect cookies: no HttpOnly, Secure, or SameSite",
            "impact": "Session hijacking via XSS"
        },
        {
            "id": "V-009",
            "name": "IDOR in Order Access",
            "tier": 1,
            "location": "/api/orders/{id}",
            "status": "planted",
            "poc": "/api/orders/1 (access other users' orders)",
            "impact": "Unauthorized data access"
        },
        {
            "id": "V-010",
            "name": "IDOR in User Profiles",
            "tier": 1,
            "location": "/api/user/profile/{id}",
            "status": "planted",
            "poc": "/api/user/profile/1",
            "impact": "PII disclosure"
        },
        {
            "id": "V-011",
            "name": "Weak JWT Secret & Algorithm Confusion",
            "tier": 2,
            "location": "JWT authentication",
            "status": "planted",
            "poc": "Crack secret or use alg:none",
            "impact": "Authentication bypass"
        },
        {
            "id": "V-012",
            "name": "Blind SQL Injection in Price Filters",
            "tier": 2,
            "location": "/api/products?min_price=...",
            "status": "planted",
            "poc": "?min_price=1 AND SLEEP(5)-- (MySQL native)",
            "impact": "Time-based data extraction via MySQL SLEEP()"
        },
        {
            "id": "V-013",
            "name": "SQL Injection via Cookie (TrackingId)",
            "tier": 2,
            "location": "Root endpoint cookie processing",
            "status": "planted",
            "poc": "Set TrackingId cookie to base64(' AND SLEEP(5)--)",
            "impact": "Database compromise via MySQL blind SQLi"
        },
        {
            "id": "V-014",
            "name": "Path Traversal in File Download",
            "tier": 1,
            "location": "/api/products/{id}/image?file=...",
            "status": "planted",
            "poc": "?file=../../etc/passwd",
            "impact": "Arbitrary file read"
        },
        {
            "id": "V-015",
            "name": "SSRF via Import URL",
            "tier": 2,
            "location": "/api/admin/import/url",
            "status": "not_implemented",
            "poc": "POST {\"source_url\": \"http://169.254.169.254/\"}",
            "impact": "Internal network access"
        },
        {
            "id": "V-016",
            "name": "XXE in XML Import",
            "tier": 2,
            "location": "/api/admin/import/xml",
            "status": "not_implemented",
            "poc": "Upload XML with external entity",
            "impact": "File disclosure, SSRF"
        },
        {
            "id": "V-017",
            "name": "Unrestricted File Upload",
            "tier": 1,
            "location": "/api/reviews (photo upload)",
            "status": "not_implemented",
            "poc": "Upload .php or .jsp file",
            "impact": "Remote code execution"
        },
        {
            "id": "V-018",
            "name": "Mass Assignment (Role Escalation)",
            "tier": 2,
            "location": "/api/user/profile",
            "status": "planted",
            "poc": "PUT {\"role\": \"admin\"}",
            "impact": "Privilege escalation"
        },
        {
            "id": "V-019",
            "name": "Improper Input Validation",
            "tier": 1,
            "location": "/api/register, /api/admin/products",
            "status": "planted",
            "poc": "Register with special chars in username",
            "impact": "Secondary injection vectors"
        },
        {
            "id": "V-020",
            "name": "GraphQL Information Disclosure & IDOR",
            "tier": 2,
            "location": "/api/graphql",
            "status": "planted",
            "poc": "Query users or orders without auth",
            "impact": "Mass data enumeration"
        },
        {
            "id": "V-021",
            "name": "Remote Code Execution via Health Check",
            "tier": 3,
            "location": "/api/health?cmd=...",
            "status": "planted",
            "poc": "/api/health?cmd=whoami (requires admin)",
            "impact": "Full system compromise"
        },
        {
            "id": "V-023",
            "name": "Price Manipulation (Trusted Client)",
            "tier": 2,
            "location": "/api/checkout",
            "status": "planted",
            "poc": "POST with modified total field",
            "impact": "Financial fraud"
        },
        {
            "id": "V-025",
            "name": "No Rate Limiting (Level 0)",
            "tier": 1,
            "location": "All endpoints",
            "status": "planted",
            "poc": "Automated brute force attacks",
            "impact": "Account enumeration, DoS"
        },
        {
            "id": "V-026",
            "name": "Insecure Deserialization (Pickle)",
            "tier": 3,
            "location": "/api/user/preferences",
            "status": "planted",
            "poc": "Craft malicious pickle payload in cookie",
            "impact": "Remote code execution"
        },
        {
            "id": "V-027",
            "name": "Server-Side Template Injection",
            "tier": 3,
            "location": "/api/admin/email-preview",
            "status": "planted",
            "poc": "{{config.__class__.__init__.__globals__}}",
            "impact": "Remote code execution"
        },
        {
            "id": "V-028",
            "name": "Broken Access Control (Admin Endpoints)",
            "tier": 2,
            "location": "/api/admin/* (some endpoints)",
            "status": "planted",
            "poc": "Access admin endpoints with user JWT",
            "impact": "Unauthorized admin actions"
        },
        {
            "id": "V-030",
            "name": "Using Components with Known Vulnerabilities",
            "tier": 1,
            "location": "jQuery 2.1.4, Lodash 4.17.15, Angular 1.7.7",
            "status": "planted",
            "poc": "Exploit known CVEs in dependencies",
            "impact": "Various (XSS, prototype pollution, etc.)"
        },
        {
            "id": "V-031",
            "name": "TOTP Brute Force (No Rate Limiting)",
            "tier": 2,
            "location": "/api/secure-portal/login",
            "status": "planted",
            "poc": "Brute force 6-digit TOTP codes (000000-999999) with no rate limit",
            "impact": "2FA bypass via exhaustive code enumeration"
        },
        {
            "id": "V-032",
            "name": "TOTP Secret Disclosure in Login Response",
            "tier": 2,
            "location": "/api/secure-portal/login",
            "status": "planted",
            "poc": "Login response includes totp_secret field — attacker can generate future codes",
            "impact": "Permanent 2FA bypass once secret is captured"
        }
    ]
    
    return {
        "total": len(vulnerabilities),
        "difficulty_level": _difficulty_level(),
        "vulnerabilities": vulnerabilities,
        "note": "This endpoint is only available in Level 0 for testing purposes",
        "powered_by": "BugTraceAI — https://bugtraceai.com"
    }
