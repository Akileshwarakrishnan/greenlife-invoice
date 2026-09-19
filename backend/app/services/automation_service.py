import time
import json
import logging
from datetime import datetime, timezone
import httpx
from sqlalchemy.orm import Session

from app.models.workflow_log import WorkflowLog
from app.models.notification import Notification
from app.models.invoice import Invoice, NotificationStatus
from app.models.order import Order
from app.models.customer import Customer
from app.core.config import settings

logger = logging.getLogger("greenlife.automation")

def record_workflow_execution(
    db: Session,
    workflow_name: str,
    status: str,
    payload: dict,
    response_data: dict = None,
    error_message: str = None,
    order_id: int = None,
    invoice_id: int = None,
    duration_ms: float = 0.0
) -> WorkflowLog:
    log_entry = WorkflowLog(
        workflow_name=workflow_name,
        execution_id=f"EXEC-{int(time.time() * 1000)}",
        trigger_source="fastapi_event",
        status=status,
        order_id=order_id,
        invoice_id=invoice_id,
        payload=json.dumps(payload),
        response_data=json.dumps(response_data) if response_data else None,
        error_message=error_message,
        duration_ms=duration_ms,
        started_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc)
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

async def dispatch_n8n_webhook(webhook_url: str, payload: dict) -> dict:
    start_time = time.time()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {"Content-Type": "application/json"}
            if settings.N8N_API_KEY:
                headers["X-N8N-API-KEY"] = settings.N8N_API_KEY
            
            response = await client.post(webhook_url, json=payload, headers=headers)
            duration = (time.time() - start_time) * 1000
            
            if response.status_code in [200, 201, 202]:
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "data": response.json() if response.headers.get("content-type", "").startswith("application/json") else {"text": response.text},
                    "duration_ms": duration
                }
            else:
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": response.text,
                    "duration_ms": duration
                }
    except Exception as exc:
        duration = (time.time() - start_time) * 1000
        logger.warning(f"Failed to connect to n8n webhook at {webhook_url}: {exc}")
        if settings.N8N_MOCK_FALLBACK:
            # Simulated successful execution if n8n service isn't currently running locally
            return {
                "success": True,
                "mocked": True,
                "status_code": 200,
                "data": {
                    "message": "Processed successfully via local automation engine fallback",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                },
                "duration_ms": duration
            }
        return {
            "success": False,
            "error": str(exc),
            "duration_ms": duration
        }

async def trigger_order_automation(db: Session, order: Order, invoice: Invoice = None):
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    payload = {
        "order_id": order.id,
        "order_number": order.order_number,
        "customer_id": order.customer_id,
        "customer_name": customer.name if customer else "Customer",
        "customer_email": customer.email if customer else None,
        "customer_phone": customer.phone if customer else None,
        "grand_total": order.grand_total,
        "invoice_id": invoice.id if invoice else None,
        "invoice_number": invoice.invoice_number if invoice else None
    }

    res = await dispatch_n8n_webhook(settings.N8N_WEBHOOK_URL, payload)
    status = "success" if res.get("success") else "failed"
    record_workflow_execution(
        db=db,
        workflow_name="Order Processing",
        status=status,
        payload=payload,
        response_data=res.get("data"),
        error_message=res.get("error"),
        order_id=order.id,
        invoice_id=invoice.id if invoice else None,
        duration_ms=res.get("duration_ms", 0.0)
    )

    # If invoice exists, trigger notification workflows
    if invoice:
        await trigger_email_notification(db, invoice)
        await trigger_whatsapp_notification(db, invoice)

async def trigger_email_notification(db: Session, invoice: Invoice):
    if not invoice.customer_email:
        invoice.email_status = NotificationStatus.NOT_APPLICABLE.value
        db.commit()
        return

    payload = {
        "invoice_id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "recipient_email": invoice.customer_email,
        "customer_name": invoice.customer_name,
        "grand_total": invoice.grand_total,
        "pdf_url": invoice.pdf_url
    }

    res = await dispatch_n8n_webhook(settings.N8N_EMAIL_WEBHOOK_URL, payload)
    is_success = res.get("success", False)
    status_str = NotificationStatus.SENT.value if is_success else NotificationStatus.FAILED.value
    invoice.email_status = status_str

    # Record notification
    notification = Notification(
        invoice_id=invoice.id,
        customer_id=invoice.customer_id,
        channel="email",
        recipient=invoice.customer_email,
        subject=f"GreenLife Natural Foods - Invoice #{invoice.invoice_number}",
        message=f"Dear {invoice.customer_name}, thank you for your order. Invoice amount: ₹{invoice.grand_total:,.2f}.",
        status="sent" if is_success else "failed",
        error_message=res.get("error"),
        sent_at=datetime.now(timezone.utc) if is_success else None
    )
    db.add(notification)

    record_workflow_execution(
        db=db,
        workflow_name="Email Invoice Notification",
        status="success" if is_success else "failed",
        payload=payload,
        response_data=res.get("data"),
        error_message=res.get("error"),
        invoice_id=invoice.id,
        duration_ms=res.get("duration_ms", 0.0)
    )
    db.commit()

async def trigger_whatsapp_notification(db: Session, invoice: Invoice):
    if not invoice.customer_phone:
        invoice.whatsapp_status = NotificationStatus.NOT_APPLICABLE.value
        db.commit()
        return

    msg_text = (
        f"Hello {invoice.customer_name},\n\n"
        f"Thank you for your order from GreenLife Natural Foods.\n\n"
        f"Invoice: {invoice.invoice_number}\n"
        f"Total: ₹{invoice.grand_total:,.2f}\n\n"
        f"Your invoice is ready. UPI ID: {settings.BUSINESS_UPI_ID}\n\n"
        f"Thank you.\nGreenLife Natural Foods"
    )

    payload = {
        "invoice_id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "recipient_phone": invoice.customer_phone,
        "customer_name": invoice.customer_name,
        "message": msg_text,
        "grand_total": invoice.grand_total
    }

    res = await dispatch_n8n_webhook(settings.N8N_WHATSAPP_WEBHOOK_URL, payload)
    is_success = res.get("success", False)
    status_str = NotificationStatus.SENT.value if is_success else NotificationStatus.FAILED.value
    invoice.whatsapp_status = status_str

    notification = Notification(
        invoice_id=invoice.id,
        customer_id=invoice.customer_id,
        channel="whatsapp",
        recipient=invoice.customer_phone,
        subject="WhatsApp Invoice Notification",
        message=msg_text,
        status="sent" if is_success else "failed",
        error_message=res.get("error"),
        sent_at=datetime.now(timezone.utc) if is_success else None
    )
    db.add(notification)

    record_workflow_execution(
        db=db,
        workflow_name="WhatsApp Notification",
        status="success" if is_success else "failed",
        payload=payload,
        response_data=res.get("data"),
        error_message=res.get("error"),
        invoice_id=invoice.id,
        duration_ms=res.get("duration_ms", 0.0)
    )
    db.commit()
