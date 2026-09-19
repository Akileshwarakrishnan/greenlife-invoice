import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("greenlife.database")

def get_engine(url: str):
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    return create_engine(url, connect_args=connect_args, pool_pre_ping=True)

try:
    engine = get_engine(settings.DATABASE_URL)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    logger.warning(f"Failed to connect to primary DATABASE_URL ({settings.DATABASE_URL}): {e}. Falling back to local SQLite.")
    settings.DATABASE_URL = "sqlite:///./greenlife.db"
    engine = get_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as conn:
            from sqlalchemy import text
            for col_name, col_type in [("name_ta", "VARCHAR(255)"), ("name_en", "VARCHAR(255)")]:
                try:
                    conn.execute(text(f"ALTER TABLE products ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                except Exception:
                    pass
            try:
                conn.execute(text("ALTER TABLE orders ADD COLUMN amount_paid FLOAT DEFAULT 0.0"))
                conn.commit()
            except Exception:
                pass
    except Exception as e:
        logger.warning(f"Error checking/migrating product/order columns: {e}")

# Run schema sync on import
init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

