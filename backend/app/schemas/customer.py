from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class CustomerBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: str
    city: Optional[str] = "Kangeyam"
    district: Optional[str] = "Tirupur"
    state: Optional[str] = "Tamil Nadu"
    pincode: Optional[str] = "638701"
    gst_number: Optional[str] = None
    notes: Optional[str] = None
    previous_balance: Optional[float] = 0.0
    is_active: Optional[bool] = True

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gst_number: Optional[str] = None
    notes: Optional[str] = None
    previous_balance: Optional[float] = None
    is_active: Optional[bool] = None

class CustomerOut(CustomerBase):
    id: int
    customer_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
