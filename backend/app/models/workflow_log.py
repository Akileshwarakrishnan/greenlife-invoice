from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from app.core.database import Base

class WorkflowLog(Base):
    __tablename__ = "workflow_logs"

    id = Column(Integer, primary_key=True, index=True)
    workflow_name = Column(String(100), index=True, nullable=False)
    execution_id = Column(String(100), index=True, nullable=True)
    trigger_source = Column(String(100), default="api")  # api, scheduled, webhook
    status = Column(String(50), default="running", nullable=False)  # success, failed, running
    
    order_id = Column(Integer, nullable=True)
    invoice_id = Column(Integer, nullable=True)
    payload = Column(Text, nullable=True)
    response_data = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    duration_ms = Column(Float, default=0.0)
    
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
