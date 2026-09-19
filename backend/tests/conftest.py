import pytest
from app.core.database import engine, Base, SessionLocal, init_db
from app.services.seed_data import seed_database
import app.models

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

