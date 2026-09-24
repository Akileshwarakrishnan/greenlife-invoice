from typing import List, Optional, Any
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.api.deps import get_db, get_current_user
from app.models.purchase import Purchase, PurchaseItem, PurchasePaymentStatus
from app.models.product import Product
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.purchase import PurchaseCreate, PurchaseUpdate, PurchaseOut
from app.services.ai_service import extract_purchase_bill_from_file

router = APIRouter()

@router.get("", response_model=List[PurchaseOut])
def get_purchases(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None,
    payment_status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    query = db.query(Purchase)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Purchase.vendor_name.ilike(s),
                Purchase.vendor_bill_number.ilike(s),
                Purchase.notes.ilike(s)
            )
        )
    if category:
        query = query.filter(Purchase.category == category)
    if payment_status:
        query = query.filter(Purchase.payment_status == payment_status)
    if start_date:
        query = query.filter(Purchase.purchase_date >= start_date)
    if end_date:
        query = query.filter(Purchase.purchase_date <= end_date)
        
    return query.order_by(Purchase.purchase_date.desc(), Purchase.id.desc()).offset(skip).limit(limit).all()

@router.get("/stats")
def get_purchase_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    total_count = db.query(Purchase).count()
    totals = db.query(
        func.sum(Purchase.grand_total).label("total_amount"),
        func.sum(Purchase.amount_paid).label("total_paid"),
        func.sum(Purchase.balance_due).label("total_due")
    ).first()

    return {
        "total_bills": total_count,
        "total_amount": float(totals.total_amount or 0.0),
        "total_paid": float(totals.total_paid or 0.0),
        "total_due": float(totals.total_due or 0.0),
    }

@router.post("/extract-bill")
async def extract_purchase_bill(
    file: UploadFile = File(...),
    ocr_text: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Accepts an uploaded vendor bill photo / image / PDF, runs AI OCR extraction,
    and returns structured vendor info, bill details, and items table.
    """
    contents = await file.read()
    file_type = file.content_type or "image/jpeg"
    file_name = file.filename or "purchase_bill.jpg"

    extracted_data = await extract_purchase_bill_from_file(
        file_bytes=contents,
        file_name=file_name,
        file_type=file_type,
        client_ocr_text=ocr_text
    )
    return {
        "success": True,
        "file_name": file_name,
        "data": extracted_data
    }

@router.post("", response_model=PurchaseOut)
def create_purchase(
    purchase_in: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Compute totals from items if not provided or to ensure arithmetic correctness
    computed_subtotal = sum(item.quantity * item.unit_price for item in purchase_in.items)
    subtotal = purchase_in.subtotal if purchase_in.subtotal > 0 else computed_subtotal
    grand_total = subtotal + purchase_in.tax_amount
    balance_due = max(0.0, grand_total - purchase_in.amount_paid)

    p_status = purchase_in.payment_status
    if purchase_in.amount_paid >= grand_total:
        p_status = PurchasePaymentStatus.PAID.value
    elif purchase_in.amount_paid > 0:
        p_status = PurchasePaymentStatus.PARTIALLY_PAID.value
    else:
        p_status = PurchasePaymentStatus.PENDING.value

    purchase = Purchase(
        vendor_name=purchase_in.vendor_name.strip(),
        vendor_bill_number=purchase_in.vendor_bill_number.strip() if purchase_in.vendor_bill_number else None,
        vendor_phone=purchase_in.vendor_phone,
        vendor_gstin=purchase_in.vendor_gstin,
        purchase_date=purchase_in.purchase_date or datetime.now(timezone.utc).date(),
        category=purchase_in.category or "Raw Materials",
        subtotal=round(subtotal, 2),
        tax_amount=round(purchase_in.tax_amount, 2),
        grand_total=round(grand_total, 2),
        amount_paid=round(purchase_in.amount_paid, 2),
        balance_due=round(balance_due, 2),
        payment_status=p_status,
        payment_method=purchase_in.payment_method or "bank_transfer",
        notes=purchase_in.notes
    )
    db.add(purchase)
    db.flush()

    # Add items and update inventory stock if requested
    for item_in in purchase_in.items:
        line_total = round(item_in.quantity * item_in.unit_price, 2)
        p_item = PurchaseItem(
            purchase_id=purchase.id,
            item_name=item_in.item_name.strip(),
            product_id=item_in.product_id,
            quantity=item_in.quantity,
            unit=item_in.unit or "kg",
            unit_price=item_in.unit_price,
            total_amount=line_total,
            auto_update_stock=item_in.auto_update_stock
        )
        db.add(p_item)

        # Auto-update product stock quantity in inventory
        if item_in.auto_update_stock:
            target_prod = None
            if item_in.product_id:
                target_prod = db.query(Product).filter(Product.id == item_in.product_id).first()
            if not target_prod and item_in.item_name:
                # Attempt to match by name
                target_prod = db.query(Product).filter(
                    Product.name.ilike(f"%{item_in.item_name.strip()}%")
                ).first()
            if target_prod:
                target_prod.stock_quantity = (target_prod.stock_quantity or 0.0) + item_in.quantity

    db.commit()
    db.refresh(purchase)

    # Record Audit
    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="CREATE",
        entity="PURCHASE",
        entity_id=str(purchase.id),
        details=f"Inward stock purchase recorded: ₹{purchase.grand_total} from {purchase.vendor_name} (Bill: {purchase.vendor_bill_number or 'N/A'})"
    )
    db.add(audit)
    db.commit()

    return purchase

@router.get("/{purchase_id}", response_model=PurchaseOut)
def get_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    p = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Purchase record not found")
    return p

@router.delete("/{purchase_id}")
def delete_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    p = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Purchase record not found")

    db.delete(p)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="DELETE",
        entity="PURCHASE",
        entity_id=str(purchase_id),
        details=f"Deleted inward purchase bill #{purchase_id}"
    )
    db.add(audit)
    db.commit()

    return {"message": "Purchase deleted successfully"}
