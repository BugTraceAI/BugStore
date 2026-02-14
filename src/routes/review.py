from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import Review, User, Product
from src.auth import get_current_user, check_role
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/reviews", tags=["reviews"])

class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    comment: str
    # V-020: Mass Assignment potential. If the user sends is_approved=True, 
    # and the backend blindly spreads the dict, it bypasses moderation.
    is_approved: bool = False

@router.get("/{product_id}")
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    """
    Get all approved reviews for a product.
    """
    return db.query(Review).filter(
        Review.product_id == product_id,
        Review.is_approved == True
    ).all()

@router.post("/")
def create_review(
    data: ReviewCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Submit a review.
    V-020: Mass Assignment vulnerability.
    """
    # Blindly using data from client (simulating mass assignment)
    new_review = Review(
        product_id=data.product_id,
        user_id=current_user.id,
        rating=data.rating,
        comment=data.comment,
        is_approved=data.is_approved # V-020: TRUSTING CLIENT on moderation flag
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

@router.delete("/{review_id}")
def delete_review(
    review_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(check_role(["staff", "admin"]))
):
    """
    Delete a review (Staff/Admin only).
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found in the hive logs.")
    
    db.delete(review)
    db.commit()
    return {"message": "Review purged from the swarm."}
