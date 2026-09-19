from typing import List, Optional, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.payment import Payment
from app.models.invoice import Invoice
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.payment import PaymentCreate, PaymentOut
from app.services.invoice_service import update_invoice_payments

router = APIRouter()

@router.get("", response_model=List[PaymentOut])
def get_payments(
    db: Session = Depends(get_db),
    invoice_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    query = db.query(Payment)
    if invoice_id:
        query = query.filter(Payment.invoice_id == invoice_id)
    if customer_id:
        query = query.filter(Payment.customer_id == customer_id)
    return query.order_by(Payment.payment_date.desc()).offset(skip).limit(limit).all()

@router.post("", response_model=PaymentOut)
def record_payment(
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    invoice = db.query(Invoice).filter(Invoice.id == payment_in.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if payment_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero")

    payment = Payment(
        invoice_id=invoice.id,
        customer_id=invoice.customer_id,
        amount=payment_in.amount,
        payment_method=payment_in.payment_method,
        transaction_reference=payment_in.transaction_reference,
        notes=payment_in.notes,
        payment_date=payment_in.payment_date or datetime.now(timezone.utc)
    )
    db.add(payment)
    db.flush()

    # Recalculate invoice totals & customer balance
    update_invoice_payments(db, invoice.id)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="RECORD_PAYMENT",
        entity="PAYMENT",
        entity_id=str(payment.id),
        details=f"Payment of ₹{payment.amount} recorded for Invoice {invoice.invoice_number} via {payment.payment_method}"
    )
    db.add(audit)
    db.commit()
    db.refresh(payment)

    return payment
