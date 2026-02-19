from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import User
from src.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/user", tags=["user"])

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None  # V-018: Mass Assignment — allows role escalation

@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user profile.
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "name": current_user.name,
        "bio": current_user.bio,
        "avatar_url": current_user.avatar_url,
        "role": current_user.role,
        "created_at": current_user.created_at
    }

@router.put("/profile")
def update_profile(
    data: ProfileUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Update profile.
    V-015: Mass Assignment vulnerability if we blindly update attributes.
    We are carefully selecting fields here, but V-015 could be planted later 
    by allowing 'role' update.
    """
    if data.name is not None:
        current_user.name = data.name
    if data.bio is not None:
        current_user.bio = data.bio
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    if data.role is not None:
        current_user.role = data.role  # V-018: Mass Assignment — no authorization check

    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated in the swarm database.", "user": current_user}

# User Preferences (V-026 Deserialization)
import pickle
import base64

class PreferencesUpdate(BaseModel):
    theme: str
    notifications: bool

@router.get("/preferences")
def get_preferences(request: Request):
    """
    Get user preferences from cookie.
    V-026: Insecure Deserialization via pickle.
    """
    cookie_value = request.cookies.get("user_prefs")
    if not cookie_value:
        return {"theme": "light", "notifications": True}
    
    try:
        # V-026: Unsafe deserialization
        decoded = base64.b64decode(cookie_value)
        prefs = pickle.loads(decoded)
        return prefs
    except Exception as e:
        return {"error": "Corrupt preferences", "detail": str(e)}

@router.post("/preferences")
def set_preferences(data: PreferencesUpdate, response: Response):
    """
    Set user preferences in cookie.
    """
    prefs = data.model_dump()
    # Serialize with pickle
    serialized = base64.b64encode(pickle.dumps(prefs)).decode()
    
    # V-026 constraint: Store as cookie
    response.set_cookie(
        key="user_prefs", 
        value=serialized,
        httponly=False, # V-008
        secure=False,
        samesite="Lax"
    )
    return {"message": "Preferences saved"}
