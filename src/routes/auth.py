from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import User
from pydantic import BaseModel, EmailStr
from typing import Optional
from src.auth import create_access_token, get_password_hash, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):
    """
    User registration.
    V-019: No validation on username (special characters allowed).
    """
    # Check if user exists
    existing_user = db.query(User).filter(
        (User.username == data.username) | (User.email == data.email)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or Email already in colony.")

    # Create new user
    new_user = User(
        username=data.username, # No validation (V-019)
        email=data.email,
        password_hash=get_password_hash(data.password), # MD5 (V-006)
        name=data.name,
        role="user"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Auto-login
    token = create_access_token({"sub": new_user.username, "userId": new_user.id, "role": new_user.role})
    
    return {
        "message": "Welcome to the colony!",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "role": new_user.role
        }
    }

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    """
    User login.
    V-007: Plaintext response of JWT.
    """
    user = db.query(User).filter(User.username == data.username).first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials. Access denied to the hive.")

    token = create_access_token({"sub": user.username, "userId": user.id, "role": user.role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }
    }
