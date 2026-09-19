import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_login():
    # Admin login seeded by default
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@greenlife.com", "password": "admin123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_order_calculate_api():
    payload = {
        "items": [
            {
                "product_name": "Idly Podi",
                "unit": "kg",
                "unit_price": 200.0,
                "quantity": 3.0,
                "tax_percentage": 0.0,
                "discount": 0.0
            }
        ],
        "courier_charges": 60.0,
        "previous_balance": 400.0,
        "discount_amount": 0.0
    }
    response = client.post("/api/orders/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["subtotal"] == 600.0
    assert data["previous_balance"] == 400.0
    assert data["courier_charges"] == 60.0
    assert data["grand_total"] == 1060.0

def test_customers_and_products_flow():
    # Login as admin
    login_res = client.post(
        "/api/auth/login",
        json={"email": "admin@greenlife.com", "password": "admin123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get products
    prod_res = client.get("/api/products", headers=headers)
    assert prod_res.status_code == 200
    products = prod_res.json()
    assert len(products) > 0

    # Get customers
    cust_res = client.get("/api/customers", headers=headers)
    assert cust_res.status_code == 200
    customers = cust_res.json()
    assert len(customers) > 0

    # Test business query endpoint
    query_res = client.post(
        "/api/ai/chat-query",
        json={"query": "What was Ravi Kumar's last order?"},
        headers=headers
    )
    assert query_res.status_code == 200
    assert "Ravi Kumar" in query_res.json()["answer"]

def test_partially_paid_order_flow():
    login_res = client.post(
        "/api/auth/login",
        json={"email": "admin@greenlife.com", "password": "admin123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create customer
    cust_res = client.post(
        "/api/customers",
        json={
            "name": "Muthu Swamy",
            "phone": "9842100001",
            "address": "15, Anna Nagar, Udumalpet",
            "previous_balance": 0.0
        },
        headers=headers
    )
    assert cust_res.status_code == 200
    cust_id = cust_res.json()["id"]

    # Create Order with partially_paid: Total = 600, Paid = 250
    order_payload = {
        "customer_id": cust_id,
        "items": [
            {
                "product_name": "Country Sugar",
                "unit": "kg",
                "unit_price": 100.0,
                "quantity": 6.0,
                "tax_percentage": 0.0,
                "discount": 0.0
            }
        ],
        "courier_charges": 0.0,
        "previous_balance": 0.0,
        "payment_status": "partially_paid",
        "payment_method": "cash",
        "amount_paid": 250.0,
        "auto_generate_invoice": True
    }
    order_res = client.post("/api/orders", json=order_payload, headers=headers)
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert order_data["amount_paid"] == 250.0
    assert order_data["grand_total"] == 600.0
    inv_id = order_data["invoice_id"]
    assert inv_id is not None

    # Check Invoice details
    inv_res = client.get(f"/api/invoices/{inv_id}", headers=headers)
    assert inv_res.status_code == 200
    inv_data = inv_res.json()
    assert inv_data["amount_paid"] == 250.0
    assert inv_data["balance_due"] == 350.0
    assert inv_data["payment_status"] == "partially_paid"

    # Verify customer previous_balance is updated to remaining balance due (350.0)
    cust_check = client.get(f"/api/customers/{cust_id}", headers=headers)
    assert cust_check.status_code == 200
    assert cust_check.json()["previous_balance"] == 350.0

