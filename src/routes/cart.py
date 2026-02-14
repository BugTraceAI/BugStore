from fastapi import APIRouter, Depends, Query, HTTPException, Request, Response
from sqlalchemy.orm import Session
from src.database import get_db
from src.cart import CartManager
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/cart", tags=["cart"])

class CartAdd(BaseModel):
    product_id: int
    quantity: int = 1

class CouponApply(BaseModel):
    code: str

def get_session_id(request: Request, response: Response):
    """
    Retrieves or creates a session_id.
    V-008: Cookie is not HttpOnly, not Secure, no SameSite.
    """
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = str(uuid.uuid4())
        response.set_cookie(key="session_id", value=session_id)
    return session_id

@router.get("/")
def get_cart(db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    manager = CartManager(db, session_id)
    items = manager.get_items()
    totals = manager.get_totals()
    return {
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else "Unknown Bug",
                "product_price": item.product.price if item.product else 0,
                "product_image": item.product.images[0].url if item.product and item.product.images else None,
                "quantity": item.quantity,
                "subtotal": (item.product.price * item.quantity) if item.product else 0
            } for item in items
        ],
        "totals": totals
    }

@router.post("/add")
def add_to_cart(data: CartAdd, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    manager = CartManager(db, session_id)
    item = manager.add_item(data.product_id, data.quantity)
    return {"message": "Success! The bug is now in your colony.", "item": item.id}

@router.post("/update")
def update_cart(data: CartAdd, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    manager = CartManager(db, session_id)
    item = manager.update_quantity(data.product_id, data.quantity)
    return {"message": "Colony population updated."}

@router.delete("/remove/{product_id}")
def remove_from_cart(product_id: int, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    manager = CartManager(db, session_id)
    manager.remove_item(product_id)
    return {"message": "The bug has been set free."}

@router.delete("/clear")
def clear_cart(db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    manager = CartManager(db, session_id)
    manager.clear()
    return {"message": "Colony cleared."}

@router.post("/apply-coupon")
def apply_coupon(data: CouponApply, db: Session = Depends(get_db), session_id: str = Depends(get_session_id)):
    manager = CartManager(db, session_id)
    coupon = manager.apply_coupon(data.code)
    
    if not coupon:
        raise HTTPException(status_code=400, detail="This code is invalid or expired.")
        
    return {
        "message": "Discount applied!",
        "discount_percent": coupon.discount_percent,
        "code": coupon.code
    }
