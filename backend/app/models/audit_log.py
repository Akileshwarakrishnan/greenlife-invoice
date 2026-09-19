from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)  # CREATE, UPDATE, DELETE, LOGIN, EXPORT, TRIGGER_WORKFLOW
    entity = Column(String(100), nullable=False)  # ORDER, INVOICE, CUSTOMER, PRODUCT, PAYMENT, AUTH
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    status = Column(String(50), default="SUCCESS")  # SUCCESS, FAILED
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
