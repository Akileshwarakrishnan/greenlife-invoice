from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class ExtractedCustomer(BaseModel):
    name: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""
    gstin: Optional[str] = ""

class ExtractedItem(BaseModel):
    product: str
    quantity: float = 1.0
    unit: str = "kg"
    price: float = 0.0
    total: Optional[float] = 0.0

class ExtractedInvoiceData(BaseModel):
    invoice_number: Optional[str] = ""
    invoice_date: Optional[str] = ""
    customer: ExtractedCustomer = ExtractedCustomer()
    items: List[ExtractedItem] = []
    subtotal: Optional[float] = 0.0
    previous_balance: Optional[float] = 0.0
    courier_charge: Optional[float] = 0.0
    discount: Optional[float] = 0.0
    tax: Optional[float] = 0.0
    grand_total: Optional[float] = 0.0

class AiExtractResponse(BaseModel):
    success: bool
    extraction_id: int
    file_name: str
    data: ExtractedInvoiceData
    confidence_score: float = 0.95
    message: Optional[str] = None

class AiChatQueryRequest(BaseModel):
    query: str
    history: Optional[List[Dict[str, str]]] = []

class AiChatQueryResponse(BaseModel):
    query: str
    answer: str
    action_taken: Optional[str] = None
    data: Optional[Any] = None
