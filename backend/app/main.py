import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database
import app.models  # Ensures all models are registered

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("greenlife.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is created and seeded
    logger.info("Initializing GreenLife Database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        # Migrate new columns to products table if missing in SQLite
        with engine.connect() as conn:
            from sqlalchemy import text
            try:
                conn.execute(text("ALTER TABLE products ADD COLUMN name_ta VARCHAR(255)"))
                conn.commit()
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE products ADD COLUMN name_en VARCHAR(255)"))
                conn.commit()
            except Exception:
                pass
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
        logger.info("Database initialized and ready.")
    except Exception as e:
        logger.error(f"Error during startup database initialization: {e}")
    
    yield
    # Shutdown
    logger.info("Application shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev frontends
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers for user-friendly error messages
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    error_msg = "; ".join([f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in errors])
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": error_msg,
            "message": "Please review the form fields and correct invalid entries."
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected server error occurred.",
            "message": "The request could not be completed. The details have been logged for inspection."
        }
    )

# Include Routers
from app.api.auth import router as auth_router
from app.api.customers import router as customers_router
from app.api.products import router as products_router
from app.api.orders import router as orders_router
from app.api.invoices import router as invoices_router
from app.api.payments import router as payments_router
from app.api.ai import router as ai_router
from app.api.reports import router as reports_router
from app.api.automation import router as automation_router
from app.api.settings import router as settings_router
from app.api.audit import router as audit_router
from app.api.purchases import router as purchases_router

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(customers_router, prefix=f"{settings.API_V1_STR}/customers", tags=["Customers"])
app.include_router(products_router, prefix=f"{settings.API_V1_STR}/products", tags=["Products"])
app.include_router(orders_router, prefix=f"{settings.API_V1_STR}/orders", tags=["Orders"])
app.include_router(invoices_router, prefix=f"{settings.API_V1_STR}/invoices", tags=["Invoices"])
app.include_router(payments_router, prefix=f"{settings.API_V1_STR}/payments", tags=["Payments"])
app.include_router(purchases_router, prefix=f"{settings.API_V1_STR}/purchases", tags=["Stock Purchases"])
app.include_router(ai_router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI & Extraction"])
app.include_router(reports_router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports & Analytics"])
app.include_router(automation_router, prefix=f"{settings.API_V1_STR}/automation", tags=["n8n Automation"])
app.include_router(settings_router, prefix=f"{settings.API_V1_STR}/settings", tags=["Settings"])
app.include_router(audit_router, prefix=f"{settings.API_V1_STR}/audit", tags=["Audit Logs"])

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "GreenLife Natural Foods - AI Invoice System API",
        "version": "1.0.0"
    }
