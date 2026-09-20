import logging
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.product import Product

logger = logging.getLogger("greenlife.seed")

def seed_database(db: Session):
    # Check if users already exist
    if db.query(User).count() > 0:
        logger.info("Database already initialized. Skipping seed.")
        return

    logger.info("Seeding initial GreenLife production credentials and standard products...")

    # 1. Essential System Users
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

    # 2. Base Organic Product Catalog
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
    db.commit()
    logger.info("Initial clean database ready. No dummy orders or invoices seeded.")
