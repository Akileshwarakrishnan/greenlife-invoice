from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class PurchaseItemBase(BaseModel):
    item_name: str
    product_id: Optional[int] = None
    quantity: float = 1.0
    unit: str = "kg"
    unit_price: float = 0.0
    total_amount: float = 0.0
    auto_update_stock: bool = True

class PurchaseItemCreate(PurchaseItemBase):
    pass

class PurchaseItemOut(PurchaseItemBase):
    id: int
    purchase_id: int
    model_config = ConfigDict(from_attributes=True)

class PurchaseBase(BaseModel):
    vendor_name: str
    vendor_bill_number: Optional[str] = None
    vendor_phone: Optional[str] = None
    vendor_gstin: Optional[str] = None
    purchase_date: Optional[date] = None
    category: str = "Raw Materials"
    payment_status: str = "paid"
    payment_method: str = "bank_transfer"
    subtotal: float = 0.0
    tax_amount: float = 0.0
    grand_total: float = 0.0
    amount_paid: float = 0.0
    balance_due: float = 0.0
    notes: Optional[str] = None

class PurchaseCreate(PurchaseBase):
    items: List[PurchaseItemCreate] = []

class PurchaseUpdate(BaseModel):
    vendor_name: Optional[str] = None
    vendor_bill_number: Optional[str] = None
    vendor_phone: Optional[str] = None
    vendor_gstin: Optional[str] = None
    purchase_date: Optional[date] = None
    category: Optional[str] = None
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None
    amount_paid: Optional[float] = None
    notes: Optional[str] = None

class PurchaseOut(PurchaseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[PurchaseItemOut] = []
    model_config = ConfigDict(from_attributes=True)
