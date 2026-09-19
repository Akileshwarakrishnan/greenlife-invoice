from app.services.pdf_service import generate_invoice_pdf
from app.utils.number_words import number_to_words_inr

def test_number_to_words_inr():
    assert number_to_words_inr(400) == "Four Hundred Only"
    assert number_to_words_inr(1060) == "One Thousand Sixty Only"
    assert number_to_words_inr(0) == "Zero Only"
    assert number_to_words_inr(25.50) == "Twenty Five Rupees and Fifty Paise Only"

def test_generate_invoice_pdf_official_template():
    invoice_payload = {
        "invoice_number": "GLNF/25-26/0712",
        "invoice_date": "12/08/2026",
        "customer_name": "embassy residency dept stores",
        "customer_address": "Embassy Residency Daffodil, Cheran Nagar, Perumbakkam, Chennai 600100",
        "customer_phone": "97887 94692",
        "payment_status": "paid",
        "payment_method": "cash",
        "subtotal": 400.0,
        "previous_balance": 600.0,
        "courier_charges": 0.0,
        "grand_total": 400.0,
        "items": [
            {
                "product_name": "இட்லி பொடி / Idli Podi",
                "unit": "250 gram",
                "quantity": 2,
                "unit_price": 200.0,
                "total_amount": 400.0
            }
        ]
    }

    pdf_bytes = generate_invoice_pdf(invoice_payload)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 5000  # PDF generated with tables and header
    assert pdf_bytes.startswith(b"%PDF")
