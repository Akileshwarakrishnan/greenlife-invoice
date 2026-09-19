import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.customer import Customer
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus, PaymentMethod
from app.models.invoice import Invoice, InvoiceItem, InvoiceStatus, NotificationStatus
from app.models.payment import Payment
from app.models.workflow_log import WorkflowLog

logger = logging.getLogger("greenlife.seed")

def seed_database(db: Session):
    # Check if users already exist
    if db.query(User).count() > 0:
        logger.info("Database already seeded. Skipping.")
        return

    logger.info("Seeding initial GreenLife database data...")

    # 1. Users
    admin_user = User(
        email="admin@greenlife.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Akileshwar (Admin)",
        role=UserRole.ADMIN.value,
        is_active=True
    )
    staff_user = User(
        email="staff@greenlife.com",
        hashed_password=get_password_hash("staff123"),
        full_name="Kavitha (Staff)",
        role=UserRole.STAFF.value,
        is_active=True
    )
    db.add_all([admin_user, staff_user])
    db.flush()

    # 2. Products
    products = [
        Product(sku="GL-CNO-01", name="Cold Pressed Coconut Oil", category="Cold Pressed Oils", unit="liter", price=320.0, tax_percentage=5.0, stock_quantity=150.0, description="100% pure chekku wood-pressed sulphur-free copra coconut oil."),
        Product(sku="GL-GNO-02", name="Cold Pressed Groundnut Oil", category="Cold Pressed Oils", unit="liter", price=240.0, tax_percentage=5.0, stock_quantity=200.0, description="Fresh farm groundnuts wood-pressed naturally without heat."),
        Product(sku="GL-SNO-03", name="Cold Pressed Gingelly (Sesame) Oil", category="Cold Pressed Oils", unit="liter", price=380.0, tax_percentage=5.0, stock_quantity=120.0, description="Traditional black sesame seeds crushed with natural palm jaggery."),
        Product(sku="GL-IDP-04", name="Traditional Idly Podi", category="Podis & Masalas", unit="kg", price=200.0, tax_percentage=0.0, stock_quantity=80.0, description="Authentic spicy South Indian idly gun powder ground with hand-picked lentils."),
        Product(sku="GL-CLP-05", name="Curry Leaves Podi (Kariveppilai)", category="Podis & Masalas", unit="kg", price=220.0, tax_percentage=0.0, stock_quantity=65.0, description="Nutrient-dense dried organic curry leaf spiced podi for rice and breakfast."),
        Product(sku="GL-SGP-06", name="Sorghum (Cholam) Poha", category="Millets & Flakes", unit="pack", price=90.0, tax_percentage=0.0, stock_quantity=110.0, description="Healthy gluten-free organic sorghum flakes."),
        Product(sku="GL-BM-07", name="Barnyard Millet Rice (Kuthiraivali)", category="Millets & Flakes", unit="kg", price=130.0, tax_percentage=0.0, stock_quantity=95.0, description="High-fiber de-husked organic barnyard millet rice."),
        Product(sku="GL-PJ-08", name="Traditional Palm Jaggery (Karupatti)", category="Natural Sweeteners", unit="kg", price=340.0, tax_percentage=0.0, stock_quantity=75.0, description="Pure unrefined palm sap jaggery rich in iron and minerals.")
    ]
    db.add_all(products)
    db.flush()

    # 3. Customers
    c1 = Customer(
        customer_code="CUST-001",
        name="Ravi Kumar",
        phone="+91 98421 88990",
        email="ravi.kumar@example.com",
        address="14, Gandhi Road, Near Old Bus Stand",
        city="Kangeyam",
        district="Tirupur",
        state="Tamil Nadu",
        pincode="638701",
        gst_number="",
        previous_balance=400.0,
        notes="Regular buyer of cold pressed oils and idly podi."
    )
    c2 = Customer(
        customer_code="CUST-002",
        name="Priya Sundaram",
        phone="+91 94432 11223",
        email="priya.sundaram@example.com",
        address="78, DB Road, RS Puram",
        city="Coimbatore",
        district="Coimbatore",
        state="Tamil Nadu",
        pincode="641002",
        gst_number="",
        previous_balance=0.0,
        notes="Prefers delivery via professional courier."
    )
    c3 = Customer(
        customer_code="CUST-003",
        name="Selvi Organic Grocery",
        phone="+91 98944 33221",
        email="orders@selviorganics.com",
        address="Shop 5, 2nd Avenue, Anna Nagar",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        pincode="600040",
        gst_number="33ABCDE5678F1Z2",
        previous_balance=1250.0,
        notes="Wholesale retailer. Invoices require GST number."
    )
    db.add_all([c1, c2, c3])
    db.flush()

    # 4. Create Sample Orders & Invoices
    # Order 1: Ravi Kumar (Idly podi 3kg @ 200 = 600, Courier = 60, Prev Balance = 400 => Grand Total = 1060)
    o1 = Order(
        order_number="ORD-2026-0001",
        customer_id=c1.id,
        subtotal=600.0,
        previous_balance=400.0,
        courier_charges=60.0,
        tax_amount=0.0,
        discount_amount=0.0,
        grand_total=1060.0,
        status=OrderStatus.DELIVERED.value,
        payment_status=PaymentStatus.PAID.value,
        payment_method=PaymentMethod.UPI.value,
        notes="Delivered via DTDC courier",
        created_at=datetime.now(timezone.utc) - timedelta(days=2)
    )
    db.add(o1)
    db.flush()

    oi1 = OrderItem(
        order_id=o1.id,
        product_id=products[3].id,
        product_name="Traditional Idly Podi",
        unit="kg",
        unit_price=200.0,
        quantity=3.0,
        tax_percentage=0.0,
        discount=0.0,
        total_amount=600.0
    )
    db.add(oi1)

    inv1 = Invoice(
        invoice_number="INV-2026-0001",
        order_id=o1.id,
        customer_id=c1.id,
        customer_name=c1.name,
        customer_phone=c1.phone,
        customer_email=c1.email,
        customer_address=c1.address,
        customer_gstin=c1.gst_number,
        invoice_date=(datetime.now(timezone.utc) - timedelta(days=2)).date(),
        subtotal=600.0,
        previous_balance=400.0,
        courier_charges=60.0,
        tax_amount=0.0,
        discount_amount=0.0,
        grand_total=1060.0,
        amount_paid=1060.0,
        balance_due=0.0,
        payment_status=InvoiceStatus.PAID.value,
        payment_method=PaymentMethod.UPI.value,
        pdf_url="/api/invoices/1/pdf",
        email_status=NotificationStatus.SENT.value,
        whatsapp_status=NotificationStatus.SENT.value,
        created_at=datetime.now(timezone.utc) - timedelta(days=2)
    )
    db.add(inv1)
    db.flush()

    inv_item1 = InvoiceItem(
        invoice_id=inv1.id,
        product_id=products[3].id,
        product_name="Traditional Idly Podi",
        unit="kg",
        quantity=3.0,
        unit_price=200.0,
        tax_percentage=0.0,
        discount=0.0,
        total_amount=600.0
    )
    db.add(inv_item1)

    p1 = Payment(
        invoice_id=inv1.id,
        customer_id=c1.id,
        amount=1060.0,
        payment_method="upi",
        transaction_reference="UPI/20260917/998811",
        notes="GPay transfer received",
        payment_date=datetime.now(timezone.utc) - timedelta(days=2)
    )
    db.add(p1)

    # Order 2: Priya Sundaram (Coconut oil 2L @ 320 = 640 + Gingelly oil 1L @ 380 = 380 => 1020 + Courier 80 + Tax 51 - Discount 50 = 1101)
    o2 = Order(
        order_number="ORD-2026-0002",
        customer_id=c2.id,
        subtotal=1020.0,
        previous_balance=0.0,
        courier_charges=80.0,
        tax_amount=51.0,
        discount_amount=50.0,
        grand_total=1101.0,
        status=OrderStatus.CONFIRMED.value,
        payment_status=PaymentStatus.PENDING.value,
        payment_method=PaymentMethod.UPI.value,
        notes="Pack in sturdy tin cans",
        created_at=datetime.now(timezone.utc) - timedelta(hours=12)
    )
    db.add(o2)
    db.flush()

    db.add_all([
        OrderItem(order_id=o2.id, product_id=products[0].id, product_name="Cold Pressed Coconut Oil", unit="liter", unit_price=320.0, quantity=2.0, tax_percentage=5.0, discount=0.0, total_amount=672.0),
        OrderItem(order_id=o2.id, product_id=products[2].id, product_name="Cold Pressed Gingelly (Sesame) Oil", unit="liter", unit_price=380.0, quantity=1.0, tax_percentage=5.0, discount=0.0, total_amount=399.0)
    ])

    inv2 = Invoice(
        invoice_number="INV-2026-0002",
        order_id=o2.id,
        customer_id=c2.id,
        customer_name=c2.name,
        customer_phone=c2.phone,
        customer_email=c2.email,
        customer_address=c2.address,
        customer_gstin=c2.gst_number,
        invoice_date=datetime.now(timezone.utc).date(),
        subtotal=1020.0,
        previous_balance=0.0,
        courier_charges=80.0,
        tax_amount=51.0,
        discount_amount=50.0,
        grand_total=1101.0,
        amount_paid=0.0,
        balance_due=1101.0,
        payment_status=InvoiceStatus.PENDING.value,
        payment_method=PaymentMethod.UPI.value,
        pdf_url="/api/invoices/2/pdf",
        email_status=NotificationStatus.SENT.value,
        whatsapp_status=NotificationStatus.SENT.value,
        created_at=datetime.now(timezone.utc) - timedelta(hours=12)
    )
    db.add(inv2)
    db.flush()

    db.add_all([
        InvoiceItem(invoice_id=inv2.id, product_id=products[0].id, product_name="Cold Pressed Coconut Oil", unit="liter", quantity=2.0, unit_price=320.0, tax_percentage=5.0, discount=0.0, total_amount=672.0),
        InvoiceItem(invoice_id=inv2.id, product_id=products[2].id, product_name="Cold Pressed Gingelly (Sesame) Oil", unit="liter", quantity=1.0, unit_price=380.0, tax_percentage=5.0, discount=0.0, total_amount=399.0)
    ])

    # Sample workflow logs
    db.add_all([
        WorkflowLog(
            workflow_name="Order Processing",
            execution_id="EXEC-172675001",
            trigger_source="api_event",
            status="success",
            order_id=o1.id,
            invoice_id=inv1.id,
            duration_ms=412.5,
            started_at=datetime.now(timezone.utc) - timedelta(days=2),
            completed_at=datetime.now(timezone.utc) - timedelta(days=2)
        ),
        WorkflowLog(
            workflow_name="Email Invoice Notification",
            execution_id="EXEC-172675002",
            trigger_source="api_event",
            status="success",
            order_id=o1.id,
            invoice_id=inv1.id,
            duration_ms=310.2,
            started_at=datetime.now(timezone.utc) - timedelta(days=2),
            completed_at=datetime.now(timezone.utc) - timedelta(days=2)
        ),
        WorkflowLog(
            workflow_name="WhatsApp Notification",
            execution_id="EXEC-172675003",
            trigger_source="api_event",
            status="success",
            order_id=o1.id,
            invoice_id=inv1.id,
            duration_ms=290.0,
            started_at=datetime.now(timezone.utc) - timedelta(days=2),
            completed_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
    ])

    db.commit()
    logger.info("Database seeding completed successfully.")
