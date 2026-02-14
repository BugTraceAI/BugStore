import os
import time
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

def get_difficulty_level():
    return int(os.getenv("BUGSTORE_DIFFICULTY", "0"))

# Basic rate limiting store: {ip: [timestamps]}
rate_limit_store = {}

def check_rate_limit(ip: str, limit: int, window: int = 60) -> bool:
    now = time.time()
    timestamps = rate_limit_store.get(ip, [])
    # Filter old timestamps
    timestamps = [t for t in timestamps if now - t < window]
    timestamps.append(now)
    rate_limit_store[ip] = timestamps
    
    if len(timestamps) > limit:
        return False
    return True

class DifficultyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        DIFFICULTY_LEVEL = get_difficulty_level()
        # Level 0: No filters
        if DIFFICULTY_LEVEL == 0:
            return await call_next(request)

        client_ip = request.client.host
        
        # Level 1: Basic Filters & Rate Limit
        if DIFFICULTY_LEVEL >= 1:
            # Rate Limit: 100 req/min
            limit = 100
            if DIFFICULTY_LEVEL >= 2: limit = 30
            
            if not check_rate_limit(client_ip, limit):
                return JSONResponse(status_code=429, content={"error": "Too Many Requests"})

            # Basic Blacklist in Query Params (Simulated WAF)
            # Blocks <, >, ', ; to complicate XSS/SQLi
            for key, value in request.query_params.items():
                if any(char in value for char in ['<', '>', "'", ';']):
                     # Generic error message
                     return JSONResponse(status_code=400, content={"error": "Invalid characters detected"})

        # Proceed
        response = await call_next(request)

        # Level 2: Headers (HSTS, CSP)
        if DIFFICULTY_LEVEL >= 2:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; object-src 'none';"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-Content-Type-Options"] = "nosniff"
        elif DIFFICULTY_LEVEL == 1:
             # Partial headers
             response.headers["X-Frame-Options"] = "SAMEORIGIN"
             
        return response
