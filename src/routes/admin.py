from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import User, Order, Product, Blog, Thread, EmailTemplate
from src.auth import check_role
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db), 
    current_user: User = Depends(check_role(["admin", "staff"]))
):
    """
    Overview stats for admin dashboard.
    """
    total_users = db.query(User).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total)).scalar() or 0
    total_products = db.query(Product).count()
    
    # Recent activity
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
        ]
    }

@router.get("/users")
def list_all_users(
    db: Session = Depends(get_db), 
    current_user: User = Depends(check_role(["admin"]))
):
    """
    Detailed user management.
    """
    return db.query(User).all()

@router.get("/vulnerable-debug-stats")
def get_vulnerable_stats(db: Session = Depends(get_db)):
    """
    V-012: Broken Access Control.
    A debug endpoint that returns sensitive stats without auth.
    Useful for attackers to gauge target size.
    """
    return {
        "db_size_estimate": "Large",
        "active_sessions": 42,
        "admin_emails": [u.email for u in db.query(User).filter(User.role == "admin").all()]
    }

# Product Management (CRUD)
class ProductBase(BaseModel):
    name: str # V-019: No validation on length or characters (XSS/clash potential)
    species: str
    latin_name: str
    price: float
    stock: int
    description: Optional[str] = None
    category: str
    care_level: str
    diet: str
    personality: str

@router.post("/products")
def create_product(
    data: ProductBase, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(check_role(["admin", "staff"]))
):
    """
    Create a new swarm specimen.
    """
    new_product = Product(**data.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/products/{product_id}")
def update_product(
    product_id: int, 
    data: ProductBase, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(check_role(["admin", "staff"]))
):
    """
    Update specimen parameters.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Specimen not found.")
    
    for key, value in data.model_dump().items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(check_role(["admin"]))
):
    """
    Retire specimen from colony.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Specimen already retired.")
    
    db.delete(product)
    db.commit()
    return {"message": "Specimen successfully retired from the colony."}

# Email Template Management (V-027 SSTI)
class TemplateUpdate(BaseModel):
    subject: str
    body: str

@router.get("/email-templates")
def list_email_templates(db: Session = Depends(get_db)):
    return db.query(EmailTemplate).all()

@router.put("/email-templates/{template_id}")
def update_email_template(
    template_id: int, 
    data: TemplateUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(check_role(["admin"]))
):
    template = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template.subject = data.subject
    template.body = data.body
    template.updated_at = func.now()
    db.commit()
    return template

@router.post("/email-preview")
def preview_email_template(
    data: TemplateUpdate, 
    current_user: User = Depends(check_role(["admin"]))
):
    """
    Live preview of email template.
    V-027: User input 'data.body' is rendered with Jinja2.
    """
    # Mock context for preview
    preview_context = {
        "user": {"name": "Larva Tester", "email": "test@bugstore.com"},
        "order": {"id": 123, "total": 99.99, "tracking_number": "BUG-123-456"},
        "token": "reset-token-sample"
    }
    
    try:
        # Import here to avoid circular dependencies if any
        import jinja2
        t = jinja2.Template(data.body)
        rendered = t.render(**preview_context)
        return {"rendered_html": rendered}
    except Exception as e:
        return {"error": str(e)}
