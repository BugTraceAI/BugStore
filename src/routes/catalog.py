from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.database import get_db
from src.models import Product
from typing import List, Optional
import os

router = APIRouter(prefix="/products", tags=["catalog"])

@router.get("/")
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 12,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get product list with vulnerable filtering (V-001, V-012).
    """
    query_str = "SELECT * FROM products WHERE 1=1"
    
    # V-001: SQL Injection via category (string concatenation)
    if category:
        query_str += f" AND category = '{category}'"
        
    # V-001: SQL Injection via search (string concatenation)
    if search:
        query_str += f" AND name LIKE '%{search}%'"
        
    # V-012: Blind SQL Injection via price filters (lack of type enforcement in query string)
    if min_price is not None:
        query_str += f" AND price >= {min_price}"
    if max_price is not None:
        query_str += f" AND price <= {max_price}"
        
    query_str += f" LIMIT {limit} OFFSET {offset}"
    
    # Execute raw SQL to allow for injection
    result = db.execute(text(query_str))
    
    # Map results and manually fetch images to stay consistent with raw SQL approach
    products_list = []
    for row in result.mappings():
        p_dict = dict(row)
        # Fetch images for this product
        from src.models import ProductImage
        images = db.query(ProductImage).filter(ProductImage.product_id == p_dict['id']).all()
        p_dict['images'] = [{"url": img.url} for img in images]
        products_list.append(p_dict)
        
    return products_list

@router.get("/{id}")
def get_product(id: int, db: Session = Depends(get_db)):
    """
    Get detailed product info.
    """
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="This bug has escaped our colony")
    
    # Ensure images are included (SQLAlchemy relationship helps here)
    p_dict = {c.name: getattr(product, c.name) for c in product.__table__.columns}
    p_dict['images'] = [{"url": img.url} for img in product.images]
    
    return p_dict

@router.get("/{id}/image")
def get_product_image(id: int, file: str = Query(...)):
    """
    Serve product image with Path Traversal vulnerability (V-014).
    """
    # Resolve static directory path relative to this file
    # src/routes/catalog.py -> src -> root
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(os.path.dirname(current_dir))
    static_images_dir = os.path.join(root_dir, "static", "images")
    
    # V-014: Path Traversal via string concatenation
    # An attacker can use ?file=../../etc/passwd or similar
    image_path = os.path.join(static_images_dir, file)
    
    # In a real exploit, this would return any file the process can read.
    # For now we just implement the logic.
    if os.path.isfile(image_path):
        return FileResponse(image_path)
    
    # Fallback to avoid breaking UI during development
    return {"error": "Image not found", "attempted_path": image_path}
