from fastapi import FastAPI, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from src.routes import catalog, cart, checkout, orders, auth, user, blog, review, forum, admin, health, redirect, debug
import os

from src.middleware.difficulty import DifficultyMiddleware

app = FastAPI(
    title="BugStore API",
    description="A deliberately vulnerable e-commerce API — Part of the BugTraceAI ecosystem (https://bugtraceai.com)",
)

# Difficulty Middleware (V-022)
app.add_middleware(DifficultyMiddleware)

# CORS setup (V-008: Overly permissive CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(catalog.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(checkout.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(blog.router, prefix="/api")
app.include_router(review.router, prefix="/api")
app.include_router(forum.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(redirect.router, prefix="/api")
app.include_router(debug.router, prefix="/api")

# Public config endpoint (non-sensitive settings for frontend)
@app.get("/api/config")
async def get_public_config():
    scoring = os.getenv("BUGSTORE_SCORING_ENABLED", "true").lower() in ("true", "1", "yes")
    return {
        "scoring_enabled": scoring,
        "difficulty_level": int(os.getenv("BUGSTORE_DIFFICULTY", "0")),
    }

# GraphQL (V-020)
from src.graphql_server import graphql_app
app.include_router(graphql_app, prefix="/api/graphql")

# Mount static assets (CSS, JS, images)
if os.path.exists("/app/static/assets"):
    app.mount("/assets", StaticFiles(directory="/app/static/assets"), name="assets")

from sqlalchemy.orm import Session
from sqlalchemy import text
from src.database import get_db
import base64
import uuid

@app.get("/")
async def read_root(request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Root endpoint - serves frontend HTML.
    V-013: SQL Injection via TrackingId cookie.
    """
    tracking_id = request.cookies.get("TrackingId")
    if not tracking_id:
        raw_id = str(uuid.uuid4())
        tracking_id = base64.b64encode(raw_id.encode()).decode()
        response.set_cookie(key="TrackingId", value=tracking_id)
    
    # V-013: Vulnerable SQL injection
    try:
        decoded_id = base64.b64decode(tracking_id).decode()
        query = f"SELECT * FROM products WHERE description = '{decoded_id}'" 
        db.execute(text(query))
    except Exception:
        pass
    
    # Serve frontend HTML
    if os.path.exists("/app/static/index.html"):
        return FileResponse("/app/static/index.html")
    return {"message": "Welcome to BugStore API", "status": "running"}

# Catch-all route for SPA (must be last)
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve React SPA for all non-API routes"""
    # Don't intercept API calls
    if full_path.startswith("api/"):
        return {"error": "Not found"}
    
    # Serve static files if they exist
    file_path = f"/app/static/{full_path}"
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Otherwise serve index.html for SPA routing
    if os.path.exists("/app/static/index.html"):
        return FileResponse("/app/static/index.html")
    
    return {"error": "Not found"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=True)
