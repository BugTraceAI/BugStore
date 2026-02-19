"""
Secure Portal - Admin with mandatory TOTP/2FA authentication.

Coexists with /admin (no 2FA) for testing both authentication flows.

Vulnerabilities planted:
- V-031: No rate-limit on TOTP verification (brute force possible)
- V-032: TOTP secret exposed in login response (info disclosure)

Original contribution by Neorichi (RSanchez), adapted for MariaDB codebase.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
import pyotp
import qrcode
import io
import base64

from src.database import get_db
from src.models import User, Order, Product
from src.auth import (
    create_access_token,
    decode_access_token,
    verify_password,
    get_current_user,
    SECRET_KEY,
    ALGORITHM
)
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/secure-portal", tags=["secure-portal"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ============================================
# Pydantic Models
# ============================================

class SecureLoginRequest(BaseModel):
    username: str
    password: str
    totp_code: str


class EnableTOTPRequest(BaseModel):
    totp_code: str


# ============================================
# Helper Functions
# ============================================

def generate_totp_secret() -> str:
    return pyotp.random_base32()


def verify_totp(secret: str, code: str) -> bool:
    """
    Verify a TOTP code.
    V-031: NO rate limiting - allows brute force of 6-digit codes.
    """
    totp = pyotp.TOTP(secret)
    return totp.verify(code)


def create_secure_access_token(data: dict) -> str:
    """Create a JWT with '2fa_verified': True claim."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=1)
    to_encode.update({"exp": expire, "2fa_verified": True})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ============================================
# Dependency: Verify token has 2FA claim
# ============================================

def get_current_user_2fa(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not payload.get("2fa_verified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint requires 2FA authentication. Use /api/secure-portal/login"
        )

    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def check_role_2fa(required_roles: list):
    def role_verifier(current_user: User = Depends(get_current_user_2fa)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient privileges for secure portal"
            )
        return current_user
    return role_verifier


# ============================================
# Authentication Endpoints
# ============================================

@router.post("/login")
def secure_login(data: SecureLoginRequest, db: Session = Depends(get_db)):
    """
    Login for secure-portal. Requires username, password AND TOTP code.

    V-031: No rate-limit on TOTP verification (brute force possible).
    V-032: TOTP secret exposed in response (info disclosure).
    """
    user = db.query(User).filter(User.username == data.username).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not user.totp_enabled or not user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="2FA not configured. Please set up TOTP first at /secure-portal/setup"
        )

    # V-031: NO rate limiting here - allows brute force of TOTP code
    if not verify_totp(user.totp_secret, data.totp_code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid TOTP code"
        )

    token = create_secure_access_token({
        "sub": user.username,
        "userId": user.id,
        "role": user.role
    })

    # V-032: Expose totp_secret in response (info disclosure)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "totp_secret": user.totp_secret  # V-032: Should not be here
        },
        "2fa_verified": True
    }


@router.post("/setup-totp")
def setup_totp(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a new TOTP secret and QR code for authenticator app setup."""
    if current_user.role not in ["admin", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin/staff can access secure portal"
        )

    secret = generate_totp_secret()

    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email,
        issuer_name="BugStore Secure Portal"
    )

    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    current_user.totp_secret = secret
    db.commit()

    return {
        "secret": secret,
        "qr_code_base64": f"data:image/png;base64,{qr_base64}",
        "provisioning_uri": provisioning_uri,
        "message": "Scan the QR code with your authenticator app, then call /enable-totp with a valid code"
    }


@router.post("/enable-totp")
def enable_totp(
    data: EnableTOTPRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Activate 2FA after verifying authenticator app is configured."""
    if not current_user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No TOTP secret found. Call /setup-totp first"
        )

    if not verify_totp(current_user.totp_secret, data.totp_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid TOTP code. Make sure your authenticator is synced"
        )

    current_user.totp_enabled = True
    db.commit()

    return {
        "message": "2FA enabled successfully! You can now use /secure-portal/login",
        "totp_enabled": True
    }


@router.post("/disable-totp")
def disable_totp(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_2fa)
):
    """Disable 2FA. Requires current 2FA authentication."""
    current_user.totp_enabled = False
    current_user.totp_secret = None
    db.commit()

    return {
        "message": "2FA disabled. You can no longer access the secure portal.",
        "totp_enabled": False
    }


# ============================================
# Protected Admin Endpoints (require 2FA)
# ============================================

@router.get("/stats")
def get_secure_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role_2fa(["admin", "staff"]))
):
    """Dashboard stats - REQUIRES 2FA authentication."""
    total_users = db.query(User).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total)).scalar() or 0
    total_products = db.query(Product).count()

    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()

    return {
        "counters": {
            "users": total_users,
            "orders": total_orders,
            "revenue": total_revenue,
            "products": total_products
        },
        "recent_orders": [
            {
                "id": o.id,
                "total": o.total,
                "status": o.status,
                "date": o.created_at
            } for o in recent_orders
        ],
        "security_level": "2FA_VERIFIED"
    }


@router.get("/users")
def list_secure_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role_2fa(["admin"]))
):
    """List users - REQUIRES 2FA authentication and admin role."""
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "totp_enabled": u.totp_enabled,
            "created_at": u.created_at
        } for u in users
    ]


@router.get("/products")
def list_secure_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role_2fa(["admin", "staff"]))
):
    """List products - REQUIRES 2FA authentication."""
    return db.query(Product).all()


@router.get("/me")
def get_secure_profile(
    current_user: User = Depends(get_current_user_2fa)
):
    """Get current user profile in secure session."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "totp_enabled": current_user.totp_enabled,
        "security_level": "2FA_VERIFIED"
    }
