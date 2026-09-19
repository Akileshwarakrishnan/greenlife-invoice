from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=True)
    name = Column(String(255), index=True, nullable=False)
    name_ta = Column(String(255), nullable=True)  # Tamil Product Name
    name_en = Column(String(255), nullable=True)  # English Product Name
    category = Column(String(100), index=True, default="General")
    unit = Column(String(50), default="kg")  # kg, liter, bottle, pouch, pack
    price = Column(Float, nullable=False, default=0.0)
    tax_percentage = Column(Float, default=0.0)  # e.g., 5.0 for 5% GST
    stock_quantity = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
