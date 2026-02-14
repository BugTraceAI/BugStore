from datetime import datetime, timedelta
from jose import jwt, JWTError
import hashlib

# V-011: Weak secret hardcoded
SECRET_KEY = "bugstore_secret_2024"
ALGORITHM = "HS256"

def create_access_token(data: dict):
    """
    Generate JWT.
    V-011: Weak configuration and potential for 'alg: none' (simulated by allowing varied algs if needed).
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=1) # 24h as per F-007
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    """
    Decode JWT.
    V-011: Insecure decoding - accepts weak algorithms.
    """
    try:
        # Deliberately allowing 'none' algorithm if user specifies it? 
        # Actually HS256 is the default but we can mock it.
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM, "none"])
        return payload
    except JWTError:
        return None

def get_password_hash(password: str):
    """
    V-006: Insecure MD5 hashing.
    """
    return hashlib.md5(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str):
    """
    Compare MD5 hashes.
    """
    return get_password_hash(plain_password) == hashed_password

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    V-011: Weak JWT validation.
    """
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate colony credentials",
        )
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Member not found in swarm")
    return user

def get_current_user_optional(token: str = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if not payload: return None
        username: str = payload.get("sub")
        return db.query(User).filter(User.username == username).first()
    except:
        return None

def check_role(required_roles: list):
    """
    RBAC dependency factory.
    """
    def role_verifier(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your colony rank is insufficient for this sector."
            )
        return current_user
    return role_verifier
