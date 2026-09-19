import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GreenLife Natural Foods — AI Automated Invoice System"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./greenlife.db")
    
    # JWT Authentication
    JWT_SECRET: str = os.getenv("JWT_SECRET", "greenlife-super-secret-key-change-in-production-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # n8n Automation Settings
    N8N_WEBHOOK_URL: str = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678/webhook/order-processing")
    N8N_EMAIL_WEBHOOK_URL: str = os.getenv("N8N_EMAIL_WEBHOOK_URL", "http://localhost:5678/webhook/email-invoice")
    N8N_WHATSAPP_WEBHOOK_URL: str = os.getenv("N8N_WHATSAPP_WEBHOOK_URL", "http://localhost:5678/webhook/whatsapp-notification")
    N8N_AI_WEBHOOK_URL: str = os.getenv("N8N_AI_WEBHOOK_URL", "http://localhost:5678/webhook/ai-extraction")
    N8N_API_URL: str = os.getenv("N8N_API_URL", "http://localhost:5678/api/v1")
    N8N_API_KEY: str = os.getenv("N8N_API_KEY", "")
    N8N_MOCK_FALLBACK: bool = True  # Allows offline / mock automation if n8n is not reachable
    
    # AI Provider Settings (Configurable: OpenAI / Ollama / LM Studio / Local)
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "openai")  # openai, ollama, lmstudio, custom
    AI_API_KEY: str = os.getenv("AI_API_KEY", "mock-or-set-your-key")
    AI_BASE_URL: str = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-4o-mini")
    
    # Notification & Messaging
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "invoices@greenlife.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "invoices@greenlife.com")
    
    WHATSAPP_API_URL: str = os.getenv("WHATSAPP_API_URL", "https://graph.facebook.com/v19.0")
    WHATSAPP_API_KEY: str = os.getenv("WHATSAPP_API_KEY", "")
    WHATSAPP_PHONE_NUMBER_ID: str = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
    
    # File Storage Settings
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")  # local, s3
    STORAGE_LOCAL_PATH: str = os.getenv("STORAGE_LOCAL_PATH", "./storage")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "ap-south-1")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "greenlife-invoices")
    
    # Business Profile Information (Official Client Bill Details)
    BUSINESS_NAME: str = "GREENLIFE NATURAL FOODS"
    BUSINESS_NAME_TA: str = "கிரீன் லைப் நேச்சுரல் புட்ஸ்"
    BUSINESS_PROPRIETOR: str = "RVS.Arumugam"
    BUSINESS_TAGLINE: str = "100% தூய இயற்கை & மரச்செக்கு பாரம்பரிய உணவுப் பொருட்கள்"
    BUSINESS_ADDRESS: str = "64, சத்திரம் வீதி, உடுமலைப்பேட்டை – 642126."
    BUSINESS_PHONE: str = "97887 94692"
    BUSINESS_EMAIL: str = "rvs.arumugam@yahoo.com"
    BUSINESS_WEBSITE: str = "www.greenlifefoods.com"
    BUSINESS_FSSAI: str = "22416495000038"
    BUSINESS_MSME: str = "TN28D0028521"
    BUSINESS_GSTIN: str = "33AAAAA0000A1Z5"
    BUSINESS_BANK_NAME: str = "SBI BRANCH - UDUMALPET"
    BUSINESS_IFSC: str = "SBIN0000944"
    BUSINESS_ACCOUNT_NAME: str = "GREEN LIFE NATURAL FOODS"
    BUSINESS_ACCOUNT_NUMBER: str = "35949191474"
    BUSINESS_UPI_ID: str = "greenlife@upi"
    CURRENCY_SYMBOL: str = "₹"
    INVOICE_PREFIX: str = "GLNF"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
