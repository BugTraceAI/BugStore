#!/usr/bin/env python3
"""
Initialize BugStore database schema
"""
from src.database import engine
from src.models import Base, User, Product, Order, OrderItem, Blog, Thread, Reply, Review, EmailTemplate, Coupon, CartItem, ProductImage

def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database initialized successfully!")

if __name__ == "__main__":
    init_db()
