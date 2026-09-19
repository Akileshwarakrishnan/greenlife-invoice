from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus, PaymentMethod
from app.models.customer import Customer
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderItemCreate, OrderCalculationResponse

def calculate_order_totals(
    items: List[OrderItemCreate],
    courier_charges: float = 0.0,
    previous_balance: float = 0.0,
    discount_amount: float = 0.0
) -> Dict[str, Any]:
    """
    Rigorously calculate order totals on the backend:
    - Subtotal = sum(qty * price - item_discount)
    - Item tax = sum(tax on each item)
    - Grand total = Subtotal + previous_balance + courier_charges + total_tax - order_discount
    """
    courier_charges = max(0.0, float(courier_charges or 0.0))
    previous_balance = float(previous_balance or 0.0)
    discount_amount = max(0.0, float(discount_amount or 0.0))
    
    subtotal = 0.0
    total_tax = 0.0
    calculated_items = []

    for item in items:
        qty = float(item.quantity)
        price = float(item.unit_price)
        item_discount = float(item.discount or 0.0)
        tax_pct = float(item.tax_percentage or 0.0)

        # Base line amount before tax
        line_base = max(0.0, (qty * price) - item_discount)
        item_tax = (line_base * tax_pct) / 100.0
        line_total = round(line_base + item_tax, 2)

        subtotal += round(qty * price, 2)
        total_tax += round(item_tax, 2)

        calculated_items.append({
            "product_id": item.product_id,
            "product_name": item.product_name,
            "unit": item.unit,
            "unit_price": price,
            "quantity": qty,
            "discount": item_discount,
            "tax_percentage": tax_pct,
            "total_amount": line_total
        })

    subtotal = round(subtotal, 2)
    total_tax = round(total_tax, 2)

    # Grand Total:
    # Subtotal + Previous Balance + Courier Charges + Tax - Discount
    grand_total = round(subtotal + previous_balance + courier_charges + total_tax - discount_amount, 2)

    return {
        "subtotal": subtotal,
        "courier_charges": round(courier_charges, 2),
        "previous_balance": round(previous_balance, 2),
        "tax_amount": total_tax,
        "discount_amount": round(discount_amount, 2),
        "grand_total": grand_total,
        "items": calculated_items
    }

def generate_order_number(db: Session) -> str:
    count = db.query(Order).count() + 1
    return f"ORD-{datetime.now(timezone.utc).year}-{count:04d}"

def create_order(db: Session, order_in: OrderCreate) -> Order:
    customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if not order_in.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one product")

    # If previous balance is not explicitly overridden, use customer's stored balance
    previous_balance = order_in.previous_balance
    if previous_balance is None or previous_balance == 0.0:
        previous_balance = customer.previous_balance or 0.0

    calc = calculate_order_totals(
        items=order_in.items,
        courier_charges=order_in.courier_charges or 0.0,
        previous_balance=previous_balance,
        discount_amount=order_in.discount_amount or 0.0
    )

    grand_total = calc["grand_total"]
    payment_status = order_in.payment_status or PaymentStatus.PENDING.value

    amount_paid = 0.0
    if payment_status == PaymentStatus.PAID.value:
        amount_paid = grand_total
    elif payment_status == PaymentStatus.PARTIALLY_PAID.value:
        if order_in.amount_paid is not None and order_in.amount_paid >= 0:
            amount_paid = min(grand_total, float(order_in.amount_paid))
        else:
            amount_paid = round(grand_total / 2, 2)
    else:
        amount_paid = 0.0

    order = Order(
        order_number=generate_order_number(db),
        customer_id=customer.id,
        subtotal=calc["subtotal"],
        previous_balance=calc["previous_balance"],
        courier_charges=calc["courier_charges"],
        tax_amount=calc["tax_amount"],
        discount_amount=calc["discount_amount"],
        grand_total=grand_total,
        amount_paid=amount_paid,
        status=OrderStatus.CONFIRMED.value,
        payment_status=payment_status,
        payment_method=order_in.payment_method or PaymentMethod.UPI.value,
        notes=order_in.notes
    )
    db.add(order)
    db.flush()

    for item_data in calc["items"]:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product_id"],
            product_name=item_data["product_name"],
            unit=item_data["unit"],
            unit_price=item_data["unit_price"],
            quantity=item_data["quantity"],
            tax_percentage=item_data["tax_percentage"],
            discount=item_data["discount"],
            total_amount=item_data["total_amount"]
        )
        db.add(order_item)

        # Deduct stock if product is linked
        if item_data["product_id"]:
            product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
            if product and product.stock_quantity >= item_data["quantity"]:
                product.stock_quantity -= item_data["quantity"]

    db.commit()
    db.refresh(order)
    return order
