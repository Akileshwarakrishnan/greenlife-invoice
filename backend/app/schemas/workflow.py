from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel

class WorkflowTriggerRequest(BaseModel):
    workflow_name: str
    order_id: Optional[int] = None
    invoice_id: Optional[int] = None
    custom_payload: Optional[dict] = None

class WorkflowLogOut(BaseModel):
    id: int
    workflow_name: str
    execution_id: Optional[str] = None
    trigger_source: str
    status: str
    order_id: Optional[int] = None
    invoice_id: Optional[int] = None
    payload: Optional[str] = None
    response_data: Optional[str] = None
    error_message: Optional[str] = None
    duration_ms: float
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkflowRetryRequest(BaseModel):
    workflow_log_id: int
