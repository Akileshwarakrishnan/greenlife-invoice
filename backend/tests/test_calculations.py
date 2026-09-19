import pytest
from app.services.order_service import calculate_order_totals
from app.schemas.order import OrderItemCreate

def test_user_prompt_exact_calculation():
    """
    Test user requirement:
    Idly Podi:
    Quantity: 3 kg
    Price: ₹200/kg
    Amount: ₹600

    Old Balance: ₹400
    Courier: ₹60
    Total: ₹1,060
    """
    items = [
        OrderItemCreate(
            product_name="Idly Podi",
            unit="kg",
            unit_price=200.0,
            quantity=3.0,
            tax_percentage=0.0,
            discount=0.0
        )
    ]

    calc = calculate_order_totals(
        items=items,
        courier_charges=60.0,
        previous_balance=400.0,
        discount_amount=0.0
    )

    assert calc["subtotal"] == 600.0
    assert calc["previous_balance"] == 400.0
    assert calc["courier_charges"] == 60.0
    assert calc["tax_amount"] == 0.0
    assert calc["discount_amount"] == 0.0
    assert calc["grand_total"] == 1060.0

def test_multi_item_order_with_tax_and_discounts():
    """
    Test multi-product order with GST and line discounts:
    Item 1: 2 L Coconut Oil @ ₹320 = ₹640 (5% tax = ₹32)
    Item 2: 1 L Gingelly Oil @ ₹380 = ₹380 (5% tax = ₹19)
    Subtotal = ₹1020
    Total Tax = ₹51
    Courier = ₹80
    Previous balance = ₹0
    Order discount = ₹50
    Grand total = 1020 + 0 + 80 + 51 - 50 = ₹1101
    """
    items = [
        OrderItemCreate(
            product_name="Cold Pressed Coconut Oil",
            unit="liter",
            unit_price=320.0,
            quantity=2.0,
            tax_percentage=5.0,
            discount=0.0
        ),
        OrderItemCreate(
            product_name="Cold Pressed Gingelly Oil",
            unit="liter",
            unit_price=380.0,
            quantity=1.0,
            tax_percentage=5.0,
            discount=0.0
        )
    ]

    calc = calculate_order_totals(
        items=items,
        courier_charges=80.0,
        previous_balance=0.0,
        discount_amount=50.0
    )

    assert calc["subtotal"] == 1020.0
    assert calc["tax_amount"] == 51.0
    assert calc["courier_charges"] == 80.0
    assert calc["discount_amount"] == 50.0
    assert calc["grand_total"] == 1101.0
