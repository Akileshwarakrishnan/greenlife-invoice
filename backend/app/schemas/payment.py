from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class PaymentCreate(BaseModel):
    invoice_id: int
    amount: float
    payment_method: str = "upi"  # cash, upi, gpay, bank_transfer, card, other
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None
    payment_date: Optional[datetime] = None

class PaymentOut(BaseModel):
    id: int
    invoice_id: int
    customer_id: Optional[int] = None
    amount: float
    payment_method: str
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None
    payment_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
