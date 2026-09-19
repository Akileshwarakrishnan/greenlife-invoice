from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel

class InvoiceItemOut(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name: str
    unit: str
    quantity: float
    unit_price: float
    tax_percentage: float
    discount: float
    total_amount: float

    class Config:
        from_attributes = True

class InvoiceOut(BaseModel):
    id: int
    invoice_number: str
    order_id: Optional[int] = None
    customer_id: int
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    customer_address: str
    customer_gstin: Optional[str] = None
    invoice_date: date
    due_date: Optional[date] = None
    subtotal: float
    previous_balance: float
    courier_charges: float
    tax_amount: float
    discount_amount: float
    grand_total: float
    amount_paid: float
    balance_due: float
    payment_status: str
    payment_method: str
    pdf_url: Optional[str] = None
    email_status: str
    whatsapp_status: str
    notes: Optional[str] = None
    created_at: datetime
    items: List[InvoiceItemOut] = []

    class Config:
        from_attributes = True

class InvoiceGenerateRequest(BaseModel):
    order_id: int
    notes: Optional[str] = None

class InvoiceResendRequest(BaseModel):
    channel: str = "both"  # "email", "whatsapp", or "both"
