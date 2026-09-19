import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.invoice import Invoice, InvoiceItem, InvoiceStatus, NotificationStatus
from app.models.order import Order, OrderItem, PaymentStatus
from app.models.customer import Customer
from app.models.payment import Payment
from app.core.config import settings
from app.services.pdf_service import generate_invoice_pdf
from app.services.storage_service import storage_service

def generate_invoice_number(db: Session) -> str:
    year = datetime.now(timezone.utc).year
    prefix = f"{settings.INVOICE_PREFIX}-{year}-"
    # Find maximum existing invoice for the current year
    existing = db.query(Invoice).filter(Invoice.invoice_number.like(f"{prefix}%")).count()
    next_num = existing + 1
    return f"{prefix}{next_num:04d}"

def create_invoice_from_order(db: Session, order_id: int, notes: str = None) -> Invoice:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.invoice:
        return order.invoice  # Invoice already generated

    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    invoice_number = generate_invoice_number(db)
    
    amount_paid = getattr(order, 'amount_paid', 0.0) or 0.0
    if order.payment_status == PaymentStatus.PAID.value:
        amount_paid = order.grand_total
        payment_status = InvoiceStatus.PAID.value
    elif order.payment_status == PaymentStatus.PARTIALLY_PAID.value:
        if amount_paid <= 0:
            amount_paid = round(order.grand_total / 2, 2)
        payment_status = InvoiceStatus.PARTIALLY_PAID.value
    else:
        amount_paid = 0.0
        payment_status = InvoiceStatus.PENDING.value

    balance_due = max(0.0, round(order.grand_total - amount_paid, 2))

    invoice = Invoice(
        invoice_number=invoice_number,
        order_id=order.id,
        customer_id=customer.id,
        customer_name=customer.name,
        customer_phone=customer.phone,
        customer_email=customer.email,
        customer_address=customer.address,
        customer_gstin=customer.gst_number,
        invoice_date=datetime.now(timezone.utc).date(),
        subtotal=order.subtotal,
        previous_balance=order.previous_balance,
        courier_charges=order.courier_charges,
        tax_amount=order.tax_amount,
        discount_amount=order.discount_amount,
        grand_total=order.grand_total,
        amount_paid=amount_paid,
        balance_due=balance_due,
        payment_status=payment_status,
        payment_method=order.payment_method,
        email_status=NotificationStatus.PENDING.value if customer.email else NotificationStatus.NOT_APPLICABLE.value,
        whatsapp_status=NotificationStatus.PENDING.value if customer.phone else NotificationStatus.NOT_APPLICABLE.value,
        notes=notes or order.notes
    )
    db.add(invoice)
    db.flush()

    # Snapshot line items
    items_snapshot = []
    for item in order.items:
        inv_item = InvoiceItem(
            invoice_id=invoice.id,
            product_id=item.product_id,
            product_name=item.product_name,
            unit=item.unit,
            quantity=item.quantity,
            unit_price=item.unit_price,
            tax_percentage=item.tax_percentage,
            discount=item.discount,
            total_amount=item.total_amount
        )
        db.add(inv_item)
        items_snapshot.append({
            "product_name": item.product_name,
            "unit": item.unit,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "tax_percentage": item.tax_percentage,
            "discount": item.discount,
            "total_amount": item.total_amount
        })

    # If already paid, record in payments table
    if amount_paid > 0:
        initial_payment = Payment(
            invoice_id=invoice.id,
            customer_id=customer.id,
            amount=amount_paid,
            payment_method=order.payment_method,
            transaction_reference="INITIAL-ORDER-PAYMENT",
            notes="Payment recorded during order creation"
        )
        db.add(initial_payment)

    # Generate and save PDF
    pdf_payload = {
        "invoice_number": invoice.invoice_number,
        "order_number": order.order_number,
        "customer_name": invoice.customer_name,
        "customer_address": invoice.customer_address,
        "customer_phone": invoice.customer_phone,
        "customer_email": invoice.customer_email,
        "customer_gstin": invoice.customer_gstin,
        "invoice_date": str(invoice.invoice_date),
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

    try:
        pdf_bytes = generate_invoice_pdf(pdf_payload)
        filename = f"{invoice.invoice_number}.pdf"
        file_path = storage_service.save_file(pdf_bytes, filename, subfolder="invoices")
        invoice.pdf_url = f"/api/invoices/{invoice.id}/pdf"
    except Exception as e:
        # Keep invoice recorded even if PDF generation error occurs
        invoice.notes = f"{invoice.notes or ''} [PDF generation warning: {str(e)}]"

    # Update customer previous balance to remaining balance due
    customer.previous_balance = balance_due

    db.commit()
    db.refresh(invoice)
    return invoice

def update_invoice_payments(db: Session, invoice_id: int):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    total_payments = db.query(Payment).filter(Payment.invoice_id == invoice.id).all()
    total_paid = sum(p.amount for p in total_payments)
    invoice.amount_paid = round(total_paid, 2)
    invoice.balance_due = max(0.0, round(invoice.grand_total - total_paid, 2))

    if invoice.balance_due <= 0.01:
        invoice.payment_status = InvoiceStatus.PAID.value
    elif invoice.amount_paid > 0:
        invoice.payment_status = InvoiceStatus.PARTIALLY_PAID.value
    else:
        invoice.payment_status = InvoiceStatus.PENDING.value

    # Also update linked customer previous balance
    customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
    if customer:
        customer.previous_balance = invoice.balance_due

    db.commit()
    db.refresh(invoice)
    return invoice
