from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_code = Column(String(50), unique=True, index=True, nullable=True)
    name = Column(String(255), index=True, nullable=False)
    phone = Column(String(50), index=True, nullable=False)
    email = Column(String(255), index=True, nullable=True)
    address = Column(Text, nullable=False)
    city = Column(String(100), default="Kangeyam")
    district = Column(String(100), default="Tirupur")
    state = Column(String(100), default="Tamil Nadu")
    pincode = Column(String(20), default="638701")
    gst_number = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    previous_balance = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="customer")
