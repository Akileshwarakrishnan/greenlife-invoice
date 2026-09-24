import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.customer import Customer
from app.models.purchase import Purchase
from app.services.seed_data import seed_database
from app.services.ai_service import parse_receipt_text_to_purchase_data, extract_purchase_bill_from_file

client = TestClient(app)

# Helper to get auth header
def get_auth_token():
    res = client.post("/api/auth/login", json={"email": "admin@greenlife.com", "password": "admin123"})
    if res.status_code == 200:
        return res.json()["access_token"]
    res2 = client.post("/api/auth/login", json={"email": "staff@greenlife.com", "password": "staff123"})
    return res2.json()["access_token"]

@pytest.fixture(scope="module")
def auth_headers():
    db = SessionLocal()
    seed_database(db)
    db.close()
    token = get_auth_token()
    return {"Authorization": f"Bearer {token}"}

# ==========================================
# 1. CUSTOMER VERIFICATION TEST CASES
# ==========================================

def test_seeded_5_customers_exist_and_return_in_api(auth_headers):
    """
    Test Case 1: Verify the 5 realistic customers are present in database
    and properly served via GET /api/customers.
    """
    res = client.get("/api/customers", headers=auth_headers)
    assert res.status_code == 200
    customers = res.json()
    assert len(customers) >= 5, f"Expected at least 5 customers, got {len(customers)}"

    cust_names = [c["name"] for c in customers]
    assert any("செல்வம்" in name or "Selvam" in name for name in cust_names), "Selvam not found"
    assert any("மகேந்திரன்" in name or "Mahendran" in name for name in cust_names), "Mahendran not found"
    assert any("கார்த்திக்" in name or "Karthik" in name for name in cust_names), "Karthik not found"
    assert any("சரவணன்" in name or "Saravanan" in name for name in cust_names), "Saravanan not found"
    assert any("முருகேசன்" in name or "Murugesan" in name for name in cust_names), "Murugesan not found"

def test_create_and_fetch_new_customer(auth_headers):
    """
    Test Case 2: Verify creating a 6th brand new customer persists
    and shows immediately in the customer list and search.
    """
    new_cust_payload = {
        "name": "ஆனந்தகுமார் (Anandakumar)",
        "phone": "98425 66006",
        "email": "anand.erode@example.com",
        "address": "22, பெருந்துறை ரோடு, ஈரோடு",
        "city": "Erode",
        "district": "Erode",
        "state": "Tamil Nadu",
        "pincode": "638001",
        "previous_balance": 550.0,
        "notes": "புதிய இயற்கை அங்காடி வாடிக்கையாளர்"
    }
    create_res = client.post("/api/customers", json=new_cust_payload, headers=auth_headers)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["name"] == new_cust_payload["name"]
    assert created["city"] == "Erode"
    assert created["previous_balance"] == 550.0
    cust_id = created["id"]

    # Verify fetching customer by ID
    get_res = client.get(f"/api/customers/{cust_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["phone"] == "98425 66006"

    # Verify customer appears in search
    search_res = client.get("/api/customers?search=Anandakumar", headers=auth_headers)
    assert search_res.status_code == 200
    search_results = search_res.json()
    assert any(c["id"] == cust_id for c in search_results)

def test_customer_search_by_city_and_phone(auth_headers):
    """
    Test Case 3: Verify customer search filters by city and telephone number.
    """
    res_city = client.get("/api/customers?search=Udumalpet", headers=auth_headers)
    assert res_city.status_code == 200
    city_matches = res_city.json()
    assert len(city_matches) >= 1
    assert any("மகேந்திரன்" in c["name"] or "Mahendran" in c["name"] for c in city_matches)

    res_phone = client.get("/api/customers?search=94433", headers=auth_headers)
    assert res_phone.status_code == 200
    phone_matches = res_phone.json()
    assert len(phone_matches) >= 1
    assert any("கார்த்திக்" in c["name"] or "Karthik" in c["name"] for c in phone_matches)

# ==========================================
# 2. RECEIPT OCR EXTRACTION TEST CASES
# ==========================================

def test_ocr_text_parser_pink_bill():
    """
    Test Case 4: Verify receipt parser directly parses the exact text of the pink receipt
    and produces ₹335.00 instead of ₹14,250!
    """
    pink_receipt_text = """ES BILL
L: 98422 27490
csuN;33AMEPG21S6MIZ5
2026/1602
TOTAL
Rounded Off
GRAND TO CAL Rs.
TOTAL ITEMS : 1
Date 0910712026
-aral 10 335.00
335.00
0.00
335.00
Rs. Three Hundred and Thirty Five Only
Total
GREEN LIFE NATURAL FOODS. : 3594919474"""

    parsed = parse_receipt_text_to_purchase_data(pink_receipt_text, "pink_bill.jpg")

    assert "தவம்" in parsed["vendor_name"] or "Thavam" in parsed["vendor_name"]
    assert parsed["vendor_bill_number"] == "2026/1602"
    assert parsed["vendor_phone"] == "9842227490"
    assert parsed["grand_total"] == 335.0, f"Expected 335.0, got {parsed['grand_total']}"
    assert parsed["amount_paid"] == 335.0
    assert parsed["subtotal"] == 335.0
    assert len(parsed["items"]) == 1
    assert parsed["items"][0]["quantity"] == 10.0
    assert parsed["items"][0]["total_amount"] == 335.0

def test_ocr_text_parser_small_150_bill():
    """
    Test Case 5: Verify parser handles a 150 rs bill properly without falling back to 14k.
    """
    bill_150_text = """SRI AMBAL TRADERS
Cell: 94421 88776
B.No: 4821
Date: 15/09/2026
Raw Sesame Oil Cakes 5 kg 30.00 150.00
GRAND TOTAL Rs. 150.00
Rs. One Hundred and Fifty Only"""

    parsed = parse_receipt_text_to_purchase_data(bill_150_text, "bill_150.jpg")
    assert parsed["grand_total"] == 150.0, f"Expected 150.0, got {parsed['grand_total']}"
    assert parsed["amount_paid"] == 150.0
    assert parsed["vendor_bill_number"] == "4821"

def test_api_extract_bill_endpoint(auth_headers):
    """
    Test Case 6: Test POST /api/purchases/extract-bill endpoint with simulated receipt upload.
    """
    test_image_bytes = b"SIMULATED_RECEIPT_IMAGE_CONTENT"
    files = {"file": ("test_bill.jpg", test_image_bytes, "image/jpeg")}
    data = {"ocr_text": "L: 98422 27490\n2026/1602\nGRAND TO CAL Rs. 335.00\nRs. Three Hundred and Thirty Five Only"}

    res = client.post("/api/purchases/extract-bill", files=files, data=data, headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    data_out = body["data"]

    assert data_out["grand_total"] == 335.0, f"Expected 335.0, got {data_out['grand_total']}"
    assert data_out["vendor_bill_number"] == "2026/1602"
    assert "தவம்" in data_out["vendor_name"] or "Thavam" in data_out["vendor_name"]

def test_create_purchase_record_from_extracted_bill(auth_headers):
    """
    Test Case 7: Save inward stock purchase using the extracted receipt data
    and verify it persists in the purchase ledger.
    """
    purchase_payload = {
        "vendor_name": "தவம் டிரேடர்ஸ் (Thavam Traders - Udumalpet)",
        "vendor_bill_number": "2026/1602",
        "vendor_phone": "98422 27490",
        "vendor_gstin": "33AMEPG2156MIZ5",
        "purchase_date": "2026-07-09",
        "category": "Raw Materials",
        "payment_method": "cash",
        "subtotal": 335.0,
        "tax_amount": 0.0,
        "grand_total": 335.0,
        "amount_paid": 335.0,
        "notes": "Pink receipt verified via AI OCR",
        "items": [
            {
                "item_name": "கம்பு 11 (Pearl Millet / Kambu)",
                "quantity": 10.0,
                "unit": "kg",
                "unit_price": 33.5,
                "auto_update_stock": False
            }
        ]
    }
    post_res = client.post("/api/purchases", json=purchase_payload, headers=auth_headers)
    assert post_res.status_code == 200
    saved = post_res.json()
    assert saved["vendor_name"] == purchase_payload["vendor_name"]
    assert saved["grand_total"] == 335.0
    assert saved["payment_status"] == "paid"
    purchase_id = saved["id"]

    # Verify retrieval
    get_res = client.get(f"/api/purchases/{purchase_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["vendor_bill_number"] == "2026/1602"
