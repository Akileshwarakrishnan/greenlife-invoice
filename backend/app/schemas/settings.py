from typing import Optional
from pydantic import BaseModel

class BusinessSettings(BaseModel):
    business_name: str
    business_tagline: str
    business_address: str
    business_phone: str
    business_email: str
    business_website: str
    business_gstin: str
    business_upi_id: str
    currency_symbol: str
    invoice_prefix: str

class AutomationSettings(BaseModel):
    n8n_webhook_url: str
    n8n_email_webhook_url: str
    n8n_whatsapp_webhook_url: str
    n8n_ai_webhook_url: str
    n8n_api_url: str
    n8n_api_key: str
    mock_fallback: bool

class AiSettings(BaseModel):
    ai_provider: str
    ai_base_url: str
    ai_model: str
    ai_api_key_configured: bool

class SystemSettingsOut(BaseModel):
    business: BusinessSettings
    automation: AutomationSettings
    ai: AiSettings

class BusinessSettingsUpdate(BaseModel):
    business_name: Optional[str] = None
    business_tagline: Optional[str] = None
    business_address: Optional[str] = None
    business_phone: Optional[str] = None
    business_email: Optional[str] = None
    business_website: Optional[str] = None
    business_gstin: Optional[str] = None
    business_upi_id: Optional[str] = None
    currency_symbol: Optional[str] = None
    invoice_prefix: Optional[str] = None
