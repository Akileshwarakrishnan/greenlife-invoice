from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_user
from app.models.invoice import Invoice, InvoiceStatus
from app.models.order import Order
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.invoice import InvoiceOut, InvoiceGenerateRequest, InvoiceResendRequest
from app.services.invoice_service import create_invoice_from_order
from app.services.pdf_service import generate_invoice_pdf
from app.services.storage_service import storage_service
from app.services.automation_service import trigger_email_notification, trigger_whatsapp_notification

router = APIRouter()

@router.get("", response_model=List[InvoiceOut])
def get_invoices(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    query = db.query(Invoice)
    if status:
        query = query.filter(Invoice.payment_status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Invoice.invoice_number.ilike(s),
                Invoice.customer_name.ilike(s),
                Invoice.customer_phone.ilike(s)
            )
        )
    return query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/generate", response_model=InvoiceOut)
def generate_invoice(
    gen_in: InvoiceGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    invoice = create_invoice_from_order(db, gen_in.order_id, notes=gen_in.notes)
    
    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="GENERATE_INVOICE",
        entity="INVOICE",
        entity_id=str(invoice.id),
        details=f"Invoice generated manually: {invoice.invoice_number}"
    )
    db.add(audit)
    db.commit()

    return invoice

@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.get("/{invoice_id}/pdf")
def download_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db)
) -> Response:
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # Generate PDF on the fly or read from storage
    items_snapshot = [
        {
            "product_name": item.product_name,
            "unit": item.unit,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "tax_percentage": item.tax_percentage,
            "discount": item.discount,
            "total_amount": item.total_amount
        }
        for item in invoice.items
    ]

    pdf_payload = {
        "invoice_number": invoice.invoice_number,
        "order_number": invoice.order.order_number if invoice.order else "Direct",
        "customer_name": invoice.customer_name,
        "customer_address": invoice.customer_address,
        "customer_phone": invoice.customer_phone,
        "customer_email": invoice.customer_email,
        "customer_gstin": invoice.customer_gstin,
        "invoice_date": str(invoice.invoice_date),
        "due_date": str(invoice.due_date) if invoice.due_date else None,
        "payment_status": invoice.payment_status,
        "payment_method": invoice.payment_method,
        "subtotal": invoice.subtotal,
        "previous_balance": invoice.previous_balance,
        "courier_charges": invoice.courier_charges,
        "tax_amount": invoice.tax_amount,
        "discount_amount": invoice.discount_amount,
        "grand_total": invoice.grand_total,
        "amount_paid": invoice.amount_paid,
        "balance_due": invoice.balance_due,
        "notes": invoice.notes,
        "items": items_snapshot
    }

    pdf_bytes = generate_invoice_pdf(pdf_payload)
    filename = f"{invoice.invoice_number}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename={filename}",
            "Cache-Control": "no-cache"
        }
    )

@router.post("/{invoice_id}/resend")
async def resend_invoice_notification(
    invoice_id: int,
    resend_req: InvoiceResendRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if resend_req.channel in ["email", "both"]:
        background_tasks.add_task(trigger_email_notification, db, invoice)
    if resend_req.channel in ["whatsapp", "both"]:
        background_tasks.add_task(trigger_whatsapp_notification, db, invoice)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="RESEND_NOTIFICATION",
        entity="INVOICE",
        entity_id=str(invoice.id),
        details=f"Notification resend triggered for invoice {invoice.invoice_number} via {resend_req.channel}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Notifications queued for invoice {invoice.invoice_number}"}
