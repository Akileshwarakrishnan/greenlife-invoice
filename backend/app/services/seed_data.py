import logging
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.customer import Customer

logger = logging.getLogger("greenlife.seed")

def seed_database(db: Session):
    logger.info("Verifying initial GreenLife system data...")

    # 1. Essential System Users
    if db.query(User).count() == 0:
        logger.info("Seeding initial administrator and staff accounts...")
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
        db.commit()
        logger.info("Users seeded successfully.")

    # 2. Base Organic Product Catalog
    if db.query(Product).count() == 0:
        logger.info("Seeding standard organic product catalog...")
        products = [
            Product(sku="GL-CNO-01", name="Cold Pressed Coconut Oil", category="Cold Pressed Oils", unit="liter", price=320.0, tax_percentage=0.0, stock_quantity=150.0, description="100% pure chekku wood-pressed sulphur-free copra coconut oil."),
            Product(sku="GL-GNO-02", name="Cold Pressed Groundnut Oil", category="Cold Pressed Oils", unit="liter", price=240.0, tax_percentage=0.0, stock_quantity=200.0, description="Fresh farm groundnuts wood-pressed naturally without heat."),
            Product(sku="GL-SNO-03", name="Cold Pressed Gingelly (Sesame) Oil", category="Cold Pressed Oils", unit="liter", price=380.0, tax_percentage=0.0, stock_quantity=120.0, description="Traditional black sesame seeds crushed with natural palm jaggery."),
            Product(sku="GL-IDP-04", name="Traditional Idly Podi", category="Podis & Masalas", unit="kg", price=200.0, tax_percentage=0.0, stock_quantity=80.0, description="Authentic spicy South Indian idly gun powder ground with hand-picked lentils."),
            Product(sku="GL-CLP-05", name="Curry Leaves Podi (Kariveppilai)", category="Podis & Masalas", unit="kg", price=220.0, tax_percentage=0.0, stock_quantity=65.0, description="Nutrient-dense dried organic curry leaf spiced podi for rice and breakfast."),
            Product(sku="GL-SGP-06", name="Sorghum (Cholam) Poha", category="Millets & Flakes", unit="pack", price=90.0, tax_percentage=0.0, stock_quantity=110.0, description="Healthy gluten-free organic sorghum flakes."),
            Product(sku="GL-BM-07", name="Barnyard Millet Rice (Kuthiraivali)", category="Millets & Flakes", unit="kg", price=130.0, tax_percentage=0.0, stock_quantity=95.0, description="High-fiber de-husked organic barnyard millet rice."),
            Product(sku="GL-PJ-08", name="Traditional Palm Jaggery (Karupatti)", category="Natural Sweeteners", unit="kg", price=340.0, tax_percentage=0.0, stock_quantity=75.0, description="Pure unrefined palm sap jaggery rich in iron and minerals.")
        ]
        db.add_all(products)
        db.commit()
        logger.info("Product catalog seeded successfully.")

    # 3. 5 Realistic Active Customers
    target_customers = [
        ("செல்வம் (Selvam)", "98422 11001", "selvam.kangeyam@gmail.com", "12, காந்தி ரோடு, காங்கேயம்", "Kangeyam", "Tirupur", "Tamil Nadu", "638701", 450.0),
        ("மகேந்திரன் (Mahendran)", "97887 22002", "mahendran.udt@gmail.com", "45, பொள்ளாச்சி ரோடு, உடுமலைப்பேட்டை", "Udumalpet", "Tirupur", "Tamil Nadu", "642126", 0.0),
        ("கார்த்திக் (Karthik)", "94433 33003", "karthik.pollachi@gmail.com", "78, மீன்கரை ரோடு, பொள்ளாச்சி", "Pollachi", "Coimbatore", "Tamil Nadu", "642001", 1200.0),
        ("சரவணன் (Saravanan)", "98650 44004", "saravanan.dpm@gmail.com", "15, கடைவீதி, தாராபுரம்", "Dharapuram", "Tirupur", "Tamil Nadu", "638656", 320.0),
        ("முருகேசன் (Murugesan)", "99440 55005", "murugesan.tirupur@gmail.com", "88, அவினாசி ரோடு, திருப்பூர்", "Tirupur", "Tirupur", "Tamil Nadu", "641602", 0.0),
    ]
    last_cust = db.query(Customer).order_by(Customer.id.desc()).first()
    next_num = (last_cust.id + 1) if last_cust else 1
    added_count = 0
    for name, phone, email, address, city, district, state, pincode, due in target_customers:
        clean_p = "".join(filter(str.isdigit, phone))
        exists = db.query(Customer).filter(Customer.phone.ilike(f"%{clean_p}%")).first()
        if not exists:
            while db.query(Customer).filter(Customer.customer_code == f"CUST-{next_num:04d}").first():
                next_num += 1
            unique_code = f"CUST-{next_num:04d}"
            next_num += 1
            c = Customer(
                customer_code=unique_code,
                name=name,
                phone=phone,
                email=email,
                address=address,
                city=city,
                district=district,
                state=state,
                pincode=pincode,
                notes="வழக்கமான வாடிக்கையாளர் (Regular Customer)",
                previous_balance=due,
                is_active=True
            )
            db.add(c)
            db.flush()
            added_count += 1
    if added_count > 0:
        db.commit()
        logger.info(f"Seeded {added_count} new realistic store customers.")
