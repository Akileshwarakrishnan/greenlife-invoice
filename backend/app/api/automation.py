from typing import List, Optional, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.workflow_log import WorkflowLog
from app.models.order import Order
from app.models.invoice import Invoice
from app.models.user import User
from app.schemas.workflow import WorkflowTriggerRequest, WorkflowLogOut, WorkflowRetryRequest
from app.services.automation_service import (
    trigger_order_automation,
    trigger_email_notification,
    trigger_whatsapp_notification,
    record_workflow_execution
)

router = APIRouter()

@router.get("/status", response_model=List[WorkflowLogOut])
def get_automation_status(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    workflow_name: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    query = db.query(WorkflowLog)
    if workflow_name:
        query = query.filter(WorkflowLog.workflow_name == workflow_name)
    return query.order_by(WorkflowLog.started_at.desc()).offset(skip).limit(limit).all()

@router.post("/trigger")
async def trigger_workflow_manual(
    trigger_req: WorkflowTriggerRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    w_name = trigger_req.workflow_name

    if w_name == "Order Processing":
        if not trigger_req.order_id:
            raise HTTPException(status_code=400, detail="order_id required for Order Processing workflow")
        order = db.query(Order).filter(Order.id == trigger_req.order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        background_tasks.add_task(trigger_order_automation, db, order, order.invoice)

    elif w_name == "Email Invoice Notification":
        if not trigger_req.invoice_id:
            raise HTTPException(status_code=400, detail="invoice_id required for Email Notification")
        invoice = db.query(Invoice).filter(Invoice.id == trigger_req.invoice_id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        background_tasks.add_task(trigger_email_notification, db, invoice)

    elif w_name == "WhatsApp Notification":
        if not trigger_req.invoice_id:
            raise HTTPException(status_code=400, detail="invoice_id required for WhatsApp Notification")
        invoice = db.query(Invoice).filter(Invoice.id == trigger_req.invoice_id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        background_tasks.add_task(trigger_whatsapp_notification, db, invoice)

    else:
        # Generic trigger record
        record_workflow_execution(
            db=db,
            workflow_name=w_name,
            status="success",
            payload=trigger_req.custom_payload or {},
            response_data={"message": f"Workflow {w_name} triggered successfully"},
            duration_ms=180.0
        )

    return {"message": f"Workflow '{w_name}' initiated successfully"}

@router.post("/retry")
async def retry_failed_workflow(
    retry_req: WorkflowRetryRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    log = db.query(WorkflowLog).filter(WorkflowLog.id == retry_req.workflow_log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Workflow log entry not found")

    if log.order_id:
        order = db.query(Order).filter(Order.id == log.order_id).first()
        if order:
            background_tasks.add_task(trigger_order_automation, db, order, order.invoice)
    elif log.invoice_id:
        invoice = db.query(Invoice).filter(Invoice.id == log.invoice_id).first()
        if invoice:
            if "Email" in log.workflow_name:
                background_tasks.add_task(trigger_email_notification, db, invoice)
            else:
                background_tasks.add_task(trigger_whatsapp_notification, db, invoice)

    log.status = "running"
    db.commit()

    return {"message": f"Retry queued for workflow log #{log.id}"}

@router.post("/webhook-callback")
def n8n_callback_listener(payload: dict, db: Session = Depends(get_db)) -> Any:
    """
    Webhook callback listener allowing n8n workflows to push updates directly to FastAPI.
    """
    w_name = payload.get("workflow_name", "n8n_callback")
    status = payload.get("status", "success")
    record_workflow_execution(
        db=db,
        workflow_name=w_name,
        status=status,
        payload=payload,
        response_data={"received": True},
        duration_ms=payload.get("duration_ms", 0.0)
    )
    return {"status": "received"}
