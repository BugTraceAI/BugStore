from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import Order, OrderItem, Product
from typing import List, Optional

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/")
def get_orders(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Get all orders.
    V-009: IDOR vulnerability - no access control.
    """
    if user_id:
        orders = db.query(Order).filter(Order.user_id == user_id).all()
    else:
        orders = db.query(Order).all()
    return [
        {
            "id": o.id,
            "user_id": o.user_id,
            "status": o.status,
            "total": o.total,
            "shipping_address": o.shipping_address,
            "tracking_number": o.tracking_number,
            "created_at": o.created_at
        } for o in orders
    ]

@router.get("/{order_id}")
def get_order_detail(order_id: int, db: Session = Depends(get_db)):
    """
    Get order details by ID.
    V-009: Direct Object Reference without authorization.
    An attacker can guess order IDs.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found in the swarm")
    
    # Manually loading items to ensure they are returned
    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    
    return {
        "id": order.id,
        "status": order.status,
        "total": order.total,
        "shipping_address": order.shipping_address,
        "created_at": order.created_at,
        "items": [
            {
                "product_name": item.product.name if item.product else "Mystery Bug",
                "quantity": item.quantity,
                "price": item.unit_price
            } for item in items
        ]
    }
