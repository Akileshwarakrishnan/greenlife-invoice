import pytest
from datetime import date
from fastapi.testclient import TestClient
from app.main import app
from app.models.purchase import Purchase

client = TestClient(app)

def test_create_outside_stock_purchase_and_tax_report():
    # 1. Login as admin
    login_res = client.post("/api/auth/login", json={"email": "admin@greenlife.com", "password": "admin123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Record an outside stock inward purchase
    purchase_payload = {
        "vendor_name": "Erode Organic Copra Mill",
        "vendor_bill_number": "EOCM-2026-89",
        "vendor_phone": "9842112345",
        "category": "Raw Materials",
        "purchase_date": str(date.today()),
        "payment_status": "paid",
        "payment_method": "bank_transfer",
        "tax_amount": 100.0,
        "amount_paid": 2100.0,
        "items": [
            {
                "item_name": "Dry Coconut Copra Grade A",
                "quantity": 10.0,
                "unit": "kg",
                "unit_price": 200.0,
                "total_amount": 2000.0,
                "auto_update_stock": True
            }
        ]
    }

    p_res = client.post("/api/purchases", json=purchase_payload, headers=headers)
    assert p_res.status_code == 200
    p_data = p_res.json()
    assert p_data["vendor_name"] == "Erode Organic Copra Mill"
    assert p_data["grand_total"] == 2100.0
    assert p_data["balance_due"] == 0.0
    assert len(p_data["items"]) == 1

    # 3. Test Annual Income Tax Report endpoint
    tax_res = client.get("/api/reports/annual-tax", headers=headers)
    assert tax_res.status_code == 200
    tax_data = tax_res.json()
    assert "financial_year" in tax_data
    assert "sales" in tax_data
    assert "purchases" in tax_data
    assert "tax_summary" in tax_data
    assert tax_data["purchases"]["count"] >= 1
    assert tax_data["purchases"]["total_expenses"] >= 2100.0

    # 4. Test Annual Tax CA CSV Export
    csv_res = client.get("/api/reports/annual-tax/export-csv", headers=headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Erode Organic Copra Mill" in csv_res.text
