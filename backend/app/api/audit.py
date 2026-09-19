from typing import List, Optional, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models.audit_log import AuditLog
from app.models.user import User

router = APIRouter()

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    entity: str
    entity_id: Optional[str] = None
    details: Optional[str] = None
    status: str
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[AuditLogOut])
def get_audit_logs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    entity: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    query = db.query(AuditLog)
    if entity:
        query = query.filter(AuditLog.entity == entity.upper())
    return query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
