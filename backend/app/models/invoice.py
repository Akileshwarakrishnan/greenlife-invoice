from datetime import datetime, timezone, date
import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class InvoiceStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIALLY_PAID = "partially_paid"
    CANCELLED = "cancelled"

class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    NOT_APPLICABLE = "not_applicable"

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True, nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    
    # Snapshot customer fields at time of invoice creation
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_email = Column(String(255), nullable=True)
    customer_address = Column(Text, nullable=False)
    customer_gstin = Column(String(50), nullable=True)
    
    invoice_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    due_date = Column(Date, nullable=True)
    
    subtotal = Column(Float, default=0.0, nullable=False)
    previous_balance = Column(Float, default=0.0, nullable=False)
    courier_charges = Column(Float, default=0.0, nullable=False)
    tax_amount = Column(Float, default=0.0, nullable=False)
    discount_amount = Column(Float, default=0.0, nullable=False)
    grand_total = Column(Float, default=0.0, nullable=False)
    amount_paid = Column(Float, default=0.0, nullable=False)
    balance_due = Column(Float, default=0.0, nullable=False)
    
    payment_status = Column(String(50), default=InvoiceStatus.PENDING.value, nullable=False)
    payment_method = Column(String(50), default="upi", nullable=False)
    
    pdf_url = Column(String(500), nullable=True)
    email_status = Column(String(50), default=NotificationStatus.PENDING.value)
    whatsapp_status = Column(String(50), default=NotificationStatus.PENDING.value)
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    order = relationship("Order", back_populates="invoice")
    customer = relationship("Customer", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="invoice", cascade="all, delete-orphan")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False, index=True)
    product_id = Column(Integer, nullable=True)
    
    product_name = Column(String(255), nullable=False)
    unit = Column(String(50), default="kg")
    quantity = Column(Float, default=1.0, nullable=False)
    unit_price = Column(Float, default=0.0, nullable=False)
    tax_percentage = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0, nullable=False)

    invoice = relationship("Invoice", back_populates="items")
