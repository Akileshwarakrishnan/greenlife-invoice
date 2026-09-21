import pytest
from app.services.tamil_product_parser import (
    parse_single_product_line,
    parse_product_text_bulk,
    translate_product_name,
    classify_category
)
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_parse_single_product_line_basic():
    # Test case from user request: "இட்லி பொடி 250 கிராம் 200"
    res = parse_single_product_line("இட்லி பொடி 250 கிராம் 200")
    assert res is not None
    assert "இட்லி பொடி" in res["name_ta"]
    assert "Idli Podi" in res["name_en"]
    assert res["unit"] == "250g"
    assert res["price"] == 200.0
    assert res["category"] == "Traditional Powders"
    assert "இட்லி பொடி / Idli Podi" in res["name"]

def test_parse_single_product_line_country_sugar():
    # Test case: "நாட்டு சர்க்கரை 1 கிலோ 90"
    res = parse_single_product_line("நாட்டு சர்க்கரை 1 கிலோ 90")
    assert res is not None
    assert "நாட்டு சர்க்கரை" in res["name_ta"]
    assert "Country Sugar" in res["name_en"]
    assert res["unit"] == "kg"
    assert res["price"] == 90.0
    assert res["category"] == "Natural Sweeteners"

def test_parse_single_product_line_sesame_oil():
    # Test case: "மரச்செக்கு நல்லெண்ணெய் 1 லிட்டர் 380"
    res = parse_single_product_line("மரச்செக்கு நல்லெண்ணெய் 1 லிட்டர் 380")
    assert res is not None
    assert "மரச்செக்கு நல்லெண்ணெய்" in res["name_ta"]
    assert "Cold Pressed Sesame Oil" in res["name_en"]
    assert res["unit"] == "liter"
    assert res["price"] == 380.0
    assert res["category"] == "Cold Pressed Oils"

def test_parse_product_text_bulk():
    raw_text = """
    இட்லி பொடி 250 கிராம் 200
    நாட்டு சர்க்கரை 1 கிலோ 90
    மரச்செக்கு நல்லெண்ணெய் 1 லிட்டர் 380
    சுக்கு காபி பொடி 100 கிராம் 85
    கருப்பு கவுனி அரிசி 2 kg 280
    """
    items = parse_product_text_bulk(raw_text)
    assert len(items) == 5

    names_en = [item["name_en"] for item in items]
    assert any("Idli Podi" in n for n in names_en)
    assert any("Country Sugar" in n for n in names_en)
    assert any("Sesame Oil" in n for n in names_en)
    assert any("Sukku" in n for n in names_en)
    assert any("Black Kavuni" in n for n in names_en)

def test_api_parse_text_and_batch_create():
    # 1. Login
    login_res = client.post(
        "/api/auth/login",
        json={"email": "admin@greenlife.com", "password": "admin123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test parse-text endpoint
    parse_payload = {
        "text": "இட்லி பொடி 250 கிராம் 200\nநாட்டு சர்க்கரை 1 கிலோ 90"
    }
    parse_res = client.post("/api/products/parse-text", json=parse_payload, headers=headers)
    assert parse_res.status_code == 200
    data = parse_res.json()
    assert data["count"] == 2
    assert data["items"][0]["unit"] == "250g"
    assert data["items"][0]["price"] == 200.0

    # 3. Test batch creation endpoint
    batch_payload = {
        "products": [
            {
                "name": data["items"][0]["name"],
                "name_ta": data["items"][0]["name_ta"],
                "name_en": data["items"][0]["name_en"],
                "category": data["items"][0]["category"],
                "unit": data["items"][0]["unit"],
                "price": data["items"][0]["price"],
                "stock_quantity": 50.0
            }
        ]
    }
    create_res = client.post("/api/products/batch", json=batch_payload, headers=headers)
    assert create_res.status_code == 200
    created = create_res.json()
    assert len(created) == 1
    assert created[0]["name_ta"] == "இட்லி பொடி"
    assert created[0]["price"] == 200.0
    assert created[0]["unit"] == "250g"

def test_parse_arithmetic_whatsapp_order_exact_user_request():
    # User's exact prompt: "கடலை எண்ணெய் – 2 லிட்டர் × ₹285 = ₹570"
    raw = "கடலை எண்ணெய் – 2 லிட்டர் × ₹285 = ₹570"
    res = parse_single_product_line(raw)
    assert res is not None
    assert "கடலை எண்ணெய்" in res["name_ta"]
    assert "Cold Pressed Groundnut Oil" in res["name_en"]
    assert res["unit"] == "liter"
    assert res["price"] == 285.0
    assert res["quantity"] == 2.0
    assert "Cold Pressed Oils" in res["category"]
    # Total calculation verification
    assert res["quantity"] * res["price"] == 570.0

