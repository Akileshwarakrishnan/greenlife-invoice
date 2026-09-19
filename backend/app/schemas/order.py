from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class OrderItemBase(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    unit: str = "kg"
    unit_price: float
    quantity: float = 1.0
    tax_percentage: Optional[float] = 0.0
    discount: Optional[float] = 0.0

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemOut(OrderItemBase):
    id: int
    total_amount: float

    class Config:
        from_attributes = True

class OrderCalculationRequest(BaseModel):
    items: List[OrderItemCreate]
    courier_charges: Optional[float] = 0.0
    previous_balance: Optional[float] = 0.0
    discount_amount: Optional[float] = 0.0

class OrderCalculationResponse(BaseModel):
    subtotal: float
    courier_charges: float
    previous_balance: float
    tax_amount: float
    discount_amount: float
    grand_total: float
    items: List[dict]

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]
    courier_charges: Optional[float] = 0.0
    previous_balance: Optional[float] = 0.0
    discount_amount: Optional[float] = 0.0
    payment_status: Optional[str] = "pending"
    payment_method: Optional[str] = "upi"
    amount_paid: Optional[float] = None
    notes: Optional[str] = None
    auto_generate_invoice: Optional[bool] = True

class OrderOut(BaseModel):
    id: int
    order_number: str
    customer_id: int
    customer_name: Optional[str] = None
    subtotal: float
    previous_balance: float
    courier_charges: float
    tax_amount: float
    discount_amount: float
    grand_total: float
    amount_paid: float = 0.0
    status: str
    payment_status: str
    payment_method: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []
    invoice_id: Optional[int] = None
    invoice_number: Optional[str] = None

    class Config:
        from_attributes = True
