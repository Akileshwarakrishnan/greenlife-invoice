from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_user
from app.models.order import Order, OrderItem
from app.models.customer import Customer
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.order import OrderCreate, OrderOut, OrderCalculationRequest, OrderCalculationResponse
from app.services.order_service import calculate_order_totals, create_order
from app.services.invoice_service import create_invoice_from_order
from app.services.automation_service import trigger_order_automation

router = APIRouter()

@router.post("/calculate", response_model=OrderCalculationResponse)
def calculate_order_preview(calc_req: OrderCalculationRequest) -> Any:
    """
    Real-time backend calculation preview endpoint.
    Guarantees client and server calculation consistency.
    """
    result = calculate_order_totals(
        items=calc_req.items,
        courier_charges=calc_req.courier_charges or 0.0,
        previous_balance=calc_req.previous_balance or 0.0,
        discount_amount=calc_req.discount_amount or 0.0
    )
    return result

@router.get("", response_model=List[OrderOut])
def get_orders(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    
    results = []
    for o in orders:
        inv_id = o.invoice.id if o.invoice else None
        inv_num = o.invoice.invoice_number if o.invoice else None
        cust_name = o.customer.name if o.customer else "Customer"
        
        results.append(OrderOut(
            id=o.id,
            order_number=o.order_number,
            customer_id=o.customer_id,
            customer_name=cust_name,
            subtotal=o.subtotal,
            previous_balance=o.previous_balance,
            courier_charges=o.courier_charges,
            tax_amount=o.tax_amount,
            discount_amount=o.discount_amount,
            grand_total=o.grand_total,
            amount_paid=o.amount_paid,
            status=o.status,
            payment_status=o.payment_status,
            payment_method=o.payment_method,
            notes=o.notes,
            created_at=o.created_at,
            updated_at=o.updated_at,
            items=o.items,
            invoice_id=inv_id,
            invoice_number=inv_num
        ))
    return results

@router.post("", response_model=OrderOut)
async def create_new_order(
    order_in: OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    order = create_order(db, order_in)

    invoice = None
    if order_in.auto_generate_invoice:
        invoice = create_invoice_from_order(db, order.id, notes=order.notes)

    # Trigger automation in background (n8n webhook dispatch)
    background_tasks.add_task(trigger_order_automation, db, order, invoice)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="CREATE",
        entity="ORDER",
        entity_id=str(order.id),
        details=f"Order created: {order.order_number} for customer ID {order.customer_id}. Grand total: ₹{order.grand_total}"
    )
    db.add(audit)
    db.commit()

    cust_name = order.customer.name if order.customer else "Customer"
    inv_id = order.invoice.id if order.invoice else None
    inv_num = order.invoice.invoice_number if order.invoice else None

    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        customer_id=order.customer_id,
        customer_name=cust_name,
        subtotal=order.subtotal,
        previous_balance=order.previous_balance,
        courier_charges=order.courier_charges,
        tax_amount=order.tax_amount,
        discount_amount=order.discount_amount,
        grand_total=order.grand_total,
        amount_paid=order.amount_paid,
        status=order.status,
        payment_status=order.payment_status,
        payment_method=order.payment_method,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=order.items,
        invoice_id=inv_id,
        invoice_number=inv_num
    )

@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    inv_id = order.invoice.id if order.invoice else None
    inv_num = order.invoice.invoice_number if order.invoice else None
    cust_name = order.customer.name if order.customer else "Customer"

    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        customer_id=order.customer_id,
        customer_name=cust_name,
        subtotal=order.subtotal,
        previous_balance=order.previous_balance,
        courier_charges=order.courier_charges,
        tax_amount=order.tax_amount,
        discount_amount=order.discount_amount,
        grand_total=order.grand_total,
        amount_paid=order.amount_paid,
        status=order.status,
        payment_status=order.payment_status,
        payment_method=order.payment_method,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=order.items,
        invoice_id=inv_id,
        invoice_number=inv_num
    )
