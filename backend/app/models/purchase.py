from datetime import datetime, timezone, date
import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class PurchasePaymentStatus(str, enum.Enum):
    PAID = "paid"
    PARTIALLY_PAID = "partially_paid"
    PENDING = "pending"

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    vendor_bill_number = Column(String(100), index=True, nullable=True)
    vendor_name = Column(String(255), nullable=False, index=True)
    vendor_phone = Column(String(50), nullable=True)
    vendor_gstin = Column(String(50), nullable=True)
    
    purchase_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    category = Column(String(100), default="Raw Materials", nullable=False)
    
    subtotal = Column(Float, default=0.0, nullable=False)
    tax_amount = Column(Float, default=0.0, nullable=False)
    grand_total = Column(Float, default=0.0, nullable=False)
    amount_paid = Column(Float, default=0.0, nullable=False)
    balance_due = Column(Float, default=0.0, nullable=False)
    
    payment_status = Column(String(50), default=PurchasePaymentStatus.PAID.value, nullable=False)
    payment_method = Column(String(50), default="bank_transfer", nullable=False)
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    items = relationship("PurchaseItem", back_populates="purchase", cascade="all, delete-orphan")

class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True, index=True)
    
    item_name = Column(String(255), nullable=False)
    quantity = Column(Float, default=1.0, nullable=False)
    unit = Column(String(50), default="kg", nullable=False)
    unit_price = Column(Float, default=0.0, nullable=False)
    total_amount = Column(Float, default=0.0, nullable=False)
    auto_update_stock = Column(Boolean, default=True)

    purchase = relationship("Purchase", back_populates="items")
    product = relationship("Product")
