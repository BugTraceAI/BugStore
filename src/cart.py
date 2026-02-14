from sqlalchemy.orm import Session
from src.models import CartItem, Product, Coupon

class CartManager:
    """
    Handles shopping cart logic using session_id for persistence.
    Deliberately maintains simplicity to allow for vulnerabilities V-023 and V-024 later.
    """
    def __init__(self, db: Session, session_id: str):
        self.db = db
        self.session_id = session_id

    def get_items(self):
        """
        Returns all items in the current session's cart.
        """
        return self.db.query(CartItem).filter(CartItem.session_id == self.session_id).all()

    def add_item(self, product_id: int, quantity: int = 1):
        """
        Add a bug to the colony (cart).
        """
        item = self.db.query(CartItem).filter(
            CartItem.session_id == self.session_id,
            CartItem.product_id == product_id
        ).first()

        if item:
            item.quantity += quantity
        else:
            item = CartItem(session_id=self.session_id, product_id=product_id, quantity=quantity)
            self.db.add(item)
        
        self.db.commit()
        self.db.refresh(item)
        return item

    def update_quantity(self, product_id: int, quantity: int):
        """
        Update the number of specimens.
        """
        item = self.db.query(CartItem).filter(
            CartItem.session_id == self.session_id,
            CartItem.product_id == product_id
        ).first()
        
        if item:
            item.quantity = quantity
            if item.quantity <= 0:
                self.db.delete(item)
                self.db.commit()
                return None
            self.db.commit()
        return item

    def remove_item(self, product_id: int):
        """
        Release the bug back to the wild (remove from cart).
        """
        self.db.query(CartItem).filter(
            CartItem.session_id == self.session_id,
            CartItem.product_id == product_id
        ).delete()
        self.db.commit()

    def clear(self):
        """
        Empty the entire colony.
        """
        self.db.query(CartItem).filter(CartItem.session_id == self.session_id).delete()
        self.db.commit()

    def get_totals(self):
        """
        Calculate totals. 
        Note: Frontend will try to override this in F-004 (V-023).
        """
        items = self.get_items()
        subtotal = sum(item.product.price * item.quantity for item in items if item.product)
        tax = subtotal * 0.08
        shipping = 5.99 if subtotal < 100 else 0
        total = subtotal + tax + shipping
        
        return {
            "subtotal": subtotal,
            "tax": tax,
            "shipping": shipping,
            "total": total
        }

    def apply_coupon(self, code: str):
        """
        Apply a discount code.
        Deliberately vulnerable to V-024 (unlimited reuse/stacking logic flaws).
        """
        coupon = self.db.query(Coupon).filter(
            Coupon.code == code, 
            Coupon.active == True
        ).first()
        
        # We don't check if it was already applied in this session (V-024)
        return coupon
