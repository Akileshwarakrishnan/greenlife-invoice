from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class ProductBase(BaseModel):
    name: str
    name_ta: Optional[str] = None
    name_en: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = "Cold Pressed Oils"
    unit: Optional[str] = "kg"
    price: float
    tax_percentage: Optional[float] = 0.0
    stock_quantity: Optional[float] = 0.0
    description: Optional[str] = None
    is_active: Optional[bool] = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    name_ta: Optional[str] = None
    name_en: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    price: Optional[float] = None
    tax_percentage: Optional[float] = None
    stock_quantity: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class ProductOut(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductParseRequest(BaseModel):
    text: str

class ParsedProductItem(BaseModel):
    raw_text: Optional[str] = None
    name: str
    name_ta: Optional[str] = None
    name_en: Optional[str] = None
    category: str = "General"
    unit: str = "kg"
    price: float = 0.0
    stock_quantity: float = 100.0
    quantity: float = 1.0
    tax_percentage: float = 0.0
    description: Optional[str] = None

class ProductParseResponse(BaseModel):
    count: int
    items: List[ParsedProductItem]

class ProductBatchCreateRequest(BaseModel):
    products: List[ProductCreate]

