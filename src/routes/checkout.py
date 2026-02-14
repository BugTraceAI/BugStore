from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import Order, OrderItem, CartItem, Product
from src.routes.cart import get_session_id
from pydantic import BaseModel
from typing import List, Optional
import json

router = APIRouter(prefix="/checkout", tags=["checkout"])

class Address(BaseModel):
    name: str
    address: str
    city: str
    zip_code: str
    country: str

class CheckoutRequest(BaseModel):
    shipping_address: Address
    payment_simulated: Optional[dict] = None
    # V-023: Trusted Client Total (frontend sends total to backend)
    total: float 

@router.post("/process")
def process_checkout(
    data: CheckoutRequest, 
    db: Session = Depends(get_db), 
    session_id: str = Depends(get_session_id)
):
    """
    Process checkout.
    V-023: Vulnerability planted - we trust the total sent from the client.
    """
    cart_items = db.query(CartItem).filter(CartItem.session_id == session_id).all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Your colony is empty. Cannot checkout.")

    # Create the order
    # V-023: Use the total from the request instead of calculating it on backend
    new_order = Order(
        total=data.total, # TRUSTING THE CLIENT (V-023)
        shipping_address=json.dumps(data.shipping_address.model_dump()),
        status="Pending"
    )
    
    db.add(new_order)
    db.flush() # Get the order ID

    for item in cart_items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.product.price if item.product else 0
        )
        db.add(order_item)
        
        # V-025: No rate limiting or stock check?
        # Simulating order confirmation
    
    # Empty cart after checkout
    db.query(CartItem).filter(CartItem.session_id == session_id).delete()
    
    db.commit()
    db.refresh(new_order)
    
    return {
        "message": "Deployment successful! Your bugs are on the way.",
        "order_id": new_order.id,
        "total_paid": new_order.total
    }
