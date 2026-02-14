from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import Blog, User
from src.auth import get_current_user, check_role
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/blog", tags=["blog"])

class BlogCreate(BaseModel):
    title: str
    content: str

@router.get("/")
def get_blogs(db: Session = Depends(get_db)):
    """
    List all blog posts.
    """
    return db.query(Blog).order_by(Blog.created_at.desc()).all()

@router.get("/{blog_id}")
def get_blog_detail(blog_id: int, db: Session = Depends(get_db)):
    """
    Get blog post details.
    """
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post lost in the swarm.")
    return blog

@router.post("/")
def create_blog(
    data: BlogCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(check_role(["staff", "admin"]))
):
    """
    Create a blog post.
    V-016: Stored XSS vulnerability. 
    We do NOT sanitize the 'content' field before saving.
    """
    new_blog = Blog(
        title=data.title,
        content=data.content, # V-016
        author_id=current_user.id
    )
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    return new_blog
