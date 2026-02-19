import hashlib
from src.database import SessionLocal, engine
from src.models import Base, User, Product, Order, OrderItem, Review, Blog, Thread, Reply, EmailTemplate, Coupon
from datetime import datetime, timedelta
import random

# Recreate tables
print("Dropping and recreating all tables...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

def get_md5_hash(password: str):
    return hashlib.md5(password.encode()).hexdigest()

print("Creating Users...")
users = [
    User(
        username="admin",
        email="admin@bugstore.com",
        password_hash=get_md5_hash("admin123"),
        role="admin",
        name="Queen Bee",
        bio="Ruler of the hive. Approach with detailed reports.",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
    ),
    # Admin with TOTP pre-configured for secure-portal testing
    User(
        username="admin2fa",
        email="admin2fa@bugstore.com",
        password_hash=get_md5_hash("admin2fa123"),
        role="admin",
        name="Secure Queen",
        bio="2FA-protected administrator for testing.",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=admin2fa",
        totp_secret="JBSWY3DPEHPK3PXP",  # Known test secret
        totp_enabled=True
    ),
    User(
        username="staff", 
        email="staff@bugstore.com", 
        password_hash=get_md5_hash("staff123"), 
        role="staff", 
        name="Worker Ant",
        bio="Applying patches to the colony mainframe.",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=staff"
    ),
    User(
        username="user", 
        email="user@bugstore.com", 
        password_hash=get_md5_hash("user123"), 
        role="user", 
        name="Curious Larva",
        bio="Just here to browse the shiny carapaces.",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
    ),
    User(
        username="hacker_pro", 
        email="hacker@darkweb.com", 
        password_hash=get_md5_hash("123456"), 
        role="user", 
        name="Anon",
        bio="Nothing to see here.",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=hacker"
    )
]
db.add_all(users)
db.commit()

# Need IDs for relationships
admin = db.query(User).filter(User.username == "admin").first()
staff = db.query(User).filter(User.username == "staff").first()
user = db.query(User).filter(User.username == "user").first()
hacker = db.query(User).filter(User.username == "hacker_pro").first()

print("Creating Products...")
products_data = [
    {
        "name": "Giant Stag Beetle",
        "species": "Dorcus titanus",
        "latin_name": "Dorcus titanus",
        "price": 45.00,
        "stock": 12,
        "category": "Beetles",
        "care_level": "Intermediate",
        "diet": "Jelly, Fruits",
        "personality": "Territorial",
        "description": "A magnificent specimen with powerful mandibles. Perfect for display or breeding programs. Requires hardwood logs and high humidity.",
        "images": [{"url": "/api/products/1/image?file=stag_beetle.jpg"}]
    },
    {
        "name": "Blue Death Feigning Beetle",
        "species": "Asbolus verrucosus",
        "latin_name": "Asbolus verrucosus",
        "price": 22.50,
        "stock": 50,
        "category": "Beetles",
        "care_level": "Beginner",
        "diet": "Omnivore",
        "personality": "Docile",
        "description": "Hardy desert beetles known for playing dead when threatened. Excellent starter pets that live long lives.",
        "images": [{"url": "/api/products/2/image?file=blue_beetle.jpg"}]
    },
    {
        "name": "Orchid Mantis",
        "species": "Hymenopus coronatus",
        "latin_name": "Hymenopus coronatus",
        "price": 85.00,
        "stock": 3,
        "category": "Mantids",
        "care_level": "Advanced",
        "diet": "Flying Insects",
        "personality": "Aggressive Hunter",
        "description": "Beautiful pink and white camouflage resembling an orchid flower. Requires precise humidity and temperature control.",
        "images": [{"url": "/api/products/3/image?file=orchid_mantis.jpg"}]
    },
    {
        "name": "Hercules Beetle Larva",
        "species": "Dynastes hercules",
        "latin_name": "Dynastes hercules",
        "price": 30.00,
        "stock": 20,
        "category": "Larvae",
        "care_level": "Intermediate",
        "diet": "Decaying Wood",
        "personality": "Hungry",
        "description": "Grow your own giant! Currently in L3 stage. Will pupate into one of the largest beetle species in the world.",
        "images": [{"url": "/api/products/4/image?file=hercules_larva.jpg"}]
    },
    {
        "name": "Goliath Birdeater",
        "species": "Theraphosa blondi",
        "latin_name": "Theraphosa blondi",
        "price": 150.00,
        "stock": 1,
        "category": "Arachnids",
        "care_level": "Expert",
        "diet": "Insects, Small Vertebrates",
        "personality": "Defensive",
        "description": "The largest spider by mass. Not for the faint of heart. Has urticating hairs and large fangs.",
        "images": [{"url": "/api/products/5/image?file=goliath_birdeater.jpg"}]
    },
    {
        "name": "Leaf Cutter Ant Colony",
        "species": "Atta cephalotes",
        "latin_name": "Atta cephalotes",
        "price": 200.00,
        "stock": 0, # Sold out
        "category": "Ants",
        "care_level": "Expert",
        "diet": "Fungus (Cultivated)",
        "personality": "Busy",
        "description": "Complete colony with queen and 50+ workers. Includes fungus starter culture. Requires large modular setup.",
        "images": [{"url": "/api/products/6/image?file=leaf_cutter_ant.jpg"}]
    },
    {
        "name": "Jumping Spider",
        "species": "Phidippus regius",
        "latin_name": "Phidippus regius",
        "price": 35.00,
        "stock": 15,
        "category": "Arachnids",
        "care_level": "Beginner",
        "diet": "Flies, Crickets",
        "personality": "Curious",
        "description": "Friendly and intelligent spider with great eyesight. Interactive and easy to care for.",
        "images": [{"url": "/api/products/7/image?file=jumping_spider.jpg"}]
    },
    {
        "name": "Rainbow Stag Beetle",
        "species": "Phalacrognathus muelleri",
        "latin_name": "Phalacrognathus muelleri",
        "price": 60.00,
        "stock": 8,
        "category": "Beetles",
        "care_level": "Intermediate",
        "diet": "Jelly, Fruits",
        "personality": "Showy",
        "description": "Stunning metallic green and red coloration. Known as the most beautiful beetle in the world.",
        "images": [{"url": "/api/products/8/image?file=rainbow_beetle.jpg"}]
    }
]

for p_data in products_data:
    images = p_data.pop('images', [])
    product = Product(**p_data)
    # Mock add images logic (Product model doesn't strictly have 'images' relationship mapped in this script context if imports handle it differently, 
    # but based on provided models.py it does through 'product_images' table if implemented, 
    # OR we just stash first image url in description/frontend assumes list. 
    # Wait, frontend assumes `product.images` is a list of objects with `.url`.
    # Let's adjust models.py assumption: `images` is a relationship to a ProductImage model or JSON field?
    # I recall seeing `images = relationship("ProductImage", ...)` in models.py (implied by frontend usage).
    # But let's check models.py quickly to correspond.
    # Ah I see `product.images?.[0]?.url` usage in ProductDetail.
    # So I need to add ProductImage objects.
    db.add(product)
    db.commit() # Get ID
    
    # Adding simplified images logic if ProductImage exists, else just skip
    # Assuming ProductImage model exists based on frontend code
    from src.models import ProductImage
    for img in images:
        db.add(ProductImage(product_id=product.id, url=img['url']))
    db.commit()

print("Creating Orders...")
orders = [
    Order(
        user_id=user.id,
        status="Delivered",
        total=67.50,
        shipping_address='{"street": "123 Main St", "city": "Bug City", "zip": "12345"}',
        created_at=datetime.utcnow() - timedelta(days=10)
    ),
    Order(
        user_id=user.id,
        status="Processing",
        total=30.00,
        shipping_address='{"street": "123 Main St", "city": "Bug City", "zip": "12345"}',
        created_at=datetime.utcnow() - timedelta(days=2)
    ),
     Order(
        user_id=hacker.id,
        status="Shipped",
        total=150.00,
        shipping_address='{"street": "DARKNET RELAY NODE 4", "city": "Anon", "zip": "00000"}',
        created_at=datetime.utcnow() - timedelta(days=5)
    )
]
db.add_all(orders)
db.commit()

print("Creating Blog Posts...")
blogs = [
    Blog(
        title="Welcome to the New BugStore!",
        content="<p>We are thrilled to announce the launch of our new platform. Browse our verified colony specimens and join the swarm discussion.</p><p>Remember: <strong>Security is our top priority!</strong> (wink)</p>",
        author_id=admin.id,
        created_at=datetime.utcnow() - timedelta(days=30)
    ),
    Blog(
        title="Top 5 Starter Bugs",
        content="<p>Just starting your journey? We recommend the Blue Death Feigning Beetle or a Jumping Spider. They are hardy and interactive.</p>",
        author_id=staff.id,
        created_at=datetime.utcnow() - timedelta(days=15)
    ),
    Blog(
        title="Holiday Shipping Update",
        content="<p>Due to cold weather, all shipments satisfy standard heat pack requirements. Delays may occur.</p>",
        author_id=admin.id,
        created_at=datetime.utcnow() - timedelta(days=2)
    )
]
db.add_all(blogs)
db.commit()

print("Creating Forum Threads...")
threads = [
    Thread(
        title="Introduce Yourself!",
        content="Who are you and what bugs do you keep? Sound off below!",
        author_id=admin.id,
        created_at=datetime.utcnow() - timedelta(days=20)
    ),
    Thread(
        title="Help with humidity control for Orchids",
        content="My terrarium keeps drying out. Any tips for maintaining 80% humidity?",
        author_id=user.id,
        created_at=datetime.utcnow() - timedelta(days=5)
    )
]
db.add_all(threads)
db.commit()

# Add replies
t1 = threads[0]
t2 = threads[1]
replies = [
    Reply(thread_id=t1.id, content="Hi! I'm just a larva looking to learn.", author_id=user.id, created_at=datetime.utcnow() - timedelta(days=19)),
    Reply(thread_id=t1.id, content="Welcome to the colony!", author_id=staff.id, created_at=datetime.utcnow() - timedelta(days=19)),
    Reply(thread_id=t2.id, content="Try sphagnum moss and reducing ventilation slightly.", author_id=staff.id, created_at=datetime.utcnow() - timedelta(days=4))
]
db.add_all(replies)
db.commit()

print("Creating Reviews...")
# Get references to created products
p1 = db.query(Product).filter(Product.name == "Blue Death Feigning Beetle").first()
p2 = db.query(Product).filter(Product.name == "Giant Stag Beetle").first()

reviews = [
    Review(product_id=p1.id, user_id=user.id, rating=5, comment="These guys are hilarious! They really do play dead.", is_approved=True),
    Review(product_id=p1.id, user_id=hacker.id, rating=1, comment="<script>alert('XSS')</script> Boring.", is_approved=True), # V-003 XSS payload
    Review(product_id=p2.id, user_id=user.id, rating=4, comment="Strong pincers! Watch your fingers.", is_approved=True)
]
db.add_all(reviews)
db.commit()


print("Creating Coupons...")
coupons = [
    Coupon(code="BUGFRIEND10", discount_percent=10, max_uses=-1, active=True),
    Coupon(code="SWARM20", discount_percent=20, max_uses=50, active=True),
    Coupon(code="FIRSTBUG", discount_percent=15, max_uses=100, active=True),
    Coupon(code="EXPIRED99", discount_percent=99, max_uses=0, active=False),
]
db.add_all(coupons)
db.commit()

print("Creating Email Templates...")
templates = [
    EmailTemplate(
        name="Welcome",
        subject="Welcome to the Swarm! 🐝",
        body="<h1>Welcome {{ user.name }}!</h1><p>We are buzzing with excitement that you joined.</p>"
    ),
    EmailTemplate(
        name="Order Confirmation",
        subject="Order #{{ order.id }} Received",
        body="<p>Hi {{ user.name }},</p><p>We received your order #{{ order.id }} for ${{ order.total }}. It is being prepared by our worker ants.</p>"
    ),
    EmailTemplate(
        name="Shipping Update",
        subject="Your bugs are on the move!",
        body="<p>Great news! Order #{{ order.id }} has shipped. Tracking: {{ order.tracking_number }}</p>"
    )
]
db.add_all(templates)
db.commit()

print("Database seeded successfully!")
db.close()
