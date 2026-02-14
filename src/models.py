from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    """
    User model for the colony members.
    V-006: Storing passwords using MD5 (insecure hashing).
    V-019: No validation on username allows for special characters.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False) # MD5
    name = Column(String)
    bio = Column(Text)
    avatar_url = Column(String)
    role = Column(String, default="user") # user, staff, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    orders = relationship("Order", back_populates="user")

class Product(Base):
    """
    Product model for BugStore catalog.
    Includes comprehensive fields for insect pets.
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    species = Column(String)
    latin_name = Column(String)
    description = Column(Text)
    personality = Column(String)
    care_level = Column(String) # Beginner, Intermediate, Expert
    price = Column(Float, nullable=False)
    diet = Column(String)
    habitat = Column(String)
    lifespan = Column(String)
    category = Column(String) # Beetles, Butterflies, Arachnids, Flying, Crawling, Exotic
    stock = Column(Integer, default=0)
    rating_avg = Column(Float, default=0)
    reviews_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    """
    Images associated with products.
    """
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    url = Column(String, nullable=False)
    alt_text = Column(String)
    sort_order = Column(Integer, default=0)

    product = relationship("Product", back_populates="images")

class CartItem(Base):
    """
    Shopping cart items linked to a session or user.
    """
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)

    product = relationship("Product")

class Coupon(Base):
    """
    Discount coupons.
    """
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    discount_percent = Column(Integer, nullable=False)
    max_uses = Column(Integer, default=-1) # -1 for unlimited
    current_uses = Column(Integer, default=0)
    active = Column(Boolean, default=True)

class Order(Base):
    """
    Customer orders.
    V-009: Insecure direct object reference (IDOR) will be possible.
    V-023: Trusting client totals.
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Allow guest orders
    status = Column(String, default="Pending") # Pending, Processing, Shipped, Delivered
    total = Column(Float, nullable=False)
    shipping_cost = Column(Float, default=0)
    tax = Column(Float, default=0)
    discount = Column(Float, default=0)
    shipping_address = Column(Text) # JSON string
    tracking_number = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order")
    user = relationship("User", back_populates="orders")

class OrderItem(Base):
    """
    Items within an order.
    """
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class Blog(Base):
    """
    Blog posts for the community hub.
    V-016: Stored XSS vulnerability will be planted in content.
    """
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False) # Stored XSS (V-016)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("User")

class Review(Base):
    """
    Product reviews by colony members.
    V-020: Review moderation bypass potential.
    V-003: Potential XSS in comments.
    """
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")
    user = relationship("User")

class Thread(Base):
    """
    Forum threads for colony discussions.
    V-001: SQL injection target (simulated in routes).
    """
    __tablename__ = "threads"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User")
    replies = relationship("Reply", back_populates="thread", cascade="all, delete-orphan")

class Reply(Base):
    """
    Thread replies.
    """
    __tablename__ = "replies"

    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("threads.id"))
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    thread = relationship("Thread", back_populates="replies")
    author = relationship("User")

class EmailTemplate(Base):
    """
    Email templates for notifications.
    V-027: SSTI vulnerability in template rendering.
    """
    __tablename__ = "email_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False) # SSTI payload here
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
