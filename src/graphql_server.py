import strawberry
from strawberry.fastapi import GraphQLRouter
from typing import List, Optional
from src.database import SessionLocal
from src.models import User as UserModel, Product as ProductModel, Order as OrderModel

# Types
@strawberry.type
class User:
    id: int
    username: str
    email: str
    role: str
    bio: Optional[str]

@strawberry.type
class Product:
    id: int
    name: str
    price: float
    stock: int

@strawberry.type
class Order:
    id: int
    user_id: Optional[int]
    status: str
    total: float
    tracking_number: Optional[str]

# Queries (V-020: Information Disclosure)
@strawberry.type
class Query:
    @strawberry.field
    def users(self) -> List[User]:
        # V-020: No pagination limits, no auth check. Enumeration of all users.
        db = SessionLocal()
        try:
            users = db.query(UserModel).all()
            return [
                User(
                    id=u.id,
                    username=u.username,
                    email=u.email,
                    role=u.role,
                    bio=u.bio
                ) for u in users
            ]
        finally:
            db.close()

    @strawberry.field
    def orders(self, user_id: Optional[int] = None) -> List[Order]:
        # V-020: Access any user's orders if user_id is provided, or ALL orders if not.
        db = SessionLocal()
        try:
            if user_id:
                orders = db.query(OrderModel).filter(OrderModel.user_id == user_id).all()
            else:
                orders = db.query(OrderModel).all()
            return [
                Order(
                    id=o.id,
                    user_id=o.user_id,
                    status=o.status,
                    total=o.total,
                    tracking_number=o.tracking_number
                ) for o in orders
            ]
        finally:
            db.close()

    @strawberry.field
    def products(self) -> List[Product]:
        db = SessionLocal()
        try:
            products = db.query(ProductModel).all()
            return [
                Product(id=p.id, name=p.name, price=p.price, stock=p.stock) for p in products
            ]
        finally:
            db.close()

# Mutations (V-020: Broken Access Control)
@strawberry.type
class Mutation:
    @strawberry.mutation
    def update_bio(self, user_id: int, bio: str) -> str:
        # V-020: IDOR. Can update any user's bio without auth check.
        db = SessionLocal()
        try:
            user = db.query(UserModel).filter(UserModel.id == user_id).first()
            if not user:
                return "User not found"

            user.bio = bio
            db.commit()
            return f"Bio updated for user {user_id}"
        finally:
            db.close()

schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema)
