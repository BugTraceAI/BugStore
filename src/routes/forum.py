from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import Thread, Reply, User
from src.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import text as sqlalchemy_text

router = APIRouter(prefix="/forum", tags=["forum"])

class ThreadCreate(BaseModel):
    title: str
    content: str

class ReplyCreate(BaseModel):
    content: str

@router.get("/threads")
def get_threads(q: Optional[str] = None, db: Session = Depends(get_db)):
    """
    List forum threads.
    V-001: SQL Injection vulnerability in search query.
    """
    if q:
        # V-001: RAW SQL with string formatting (DANGEROUS)
        query = f"SELECT * FROM threads WHERE title LIKE '%{q}%' OR content LIKE '%{q}%'"
        result = db.execute(sqlalchemy_text(query))
        return [dict(row._mapping) for row in result]
    
    return db.query(Thread).order_by(Thread.created_at.desc()).all()

@router.get("/threads/{thread_id}")
def get_thread_detail(thread_id: str, db: Session = Depends(get_db)):
    """
    Get thread details and replies.
    V-001: SQL Injection vulnerability in thread_id parameter.
    """
    # V-001: RAW SQL with string formatting (DANGEROUS)
    query = f"SELECT * FROM threads WHERE id = {thread_id}"
    try:
        thread_result = db.execute(sqlalchemy_text(query)).first()
        if not thread_result:
            raise HTTPException(status_code=404, detail="Thread not found in the swarm.")
        
        thread_data = dict(thread_result._mapping)
        
        # Get replies normally or via SQLi prone query
        replies = db.query(Reply).filter(Reply.thread_id == thread_data['id']).all()
        
        return {
            **thread_data,
            "replies": replies
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

@router.post("/threads")
def create_thread(
    data: ThreadCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Create a new forum thread.
    """
    new_thread = Thread(
        title=data.title,
        content=data.content,
        author_id=current_user.id
    )
    db.add(new_thread)
    db.commit()
    db.refresh(new_thread)
    return new_thread

@router.post("/threads/{thread_id}/replies")
def create_reply(
    thread_id: int,
    data: ReplyCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Reply to a thread.
    """
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Cannot reply to a ghost thread.")
    
    new_reply = Reply(
        thread_id=thread_id,
        content=data.content,
        author_id=current_user.id
    )
    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)
    return new_reply
