from typing import Optional
from pydantic import BaseModel

class BusinessSettings(BaseModel):
    business_name: str
    business_name_ta: Optional[str] = "கிரீன் லைப் நேச்சுரல் புட்ஸ்"
    business_proprietor: Optional[str] = "RVS.Arumugam"
    business_tagline: str
    business_address: str
    business_phone: str
    business_email: str
    business_website: str
    business_fssai: Optional[str] = "22416495000038"
    business_msme: Optional[str] = "TN28D0028521"
    business_gstin: str
    business_bank_name: Optional[str] = "SBI BRANCH - UDUMALPET"
    business_ifsc: Optional[str] = "SBIN0000944"
    business_account_name: Optional[str] = "GREEN LIFE NATURAL FOODS"
    business_account_number: Optional[str] = "35949191474"
    business_upi_id: str
    currency_symbol: str
    invoice_prefix: str
    default_gst_mode: Optional[str] = "exempt"
    default_b2b_gst_rate: Optional[float] = 5.0
    default_retail_gst_rate: Optional[float] = 0.0

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
    business_name_ta: Optional[str] = None
    business_proprietor: Optional[str] = None
    business_tagline: Optional[str] = None
    business_address: Optional[str] = None
    business_phone: Optional[str] = None
    business_email: Optional[str] = None
    business_website: Optional[str] = None
    business_fssai: Optional[str] = None
    business_msme: Optional[str] = None
    business_gstin: Optional[str] = None
    business_bank_name: Optional[str] = None
    business_ifsc: Optional[str] = None
    business_account_name: Optional[str] = None
    business_account_number: Optional[str] = None
    business_upi_id: Optional[str] = None
    currency_symbol: Optional[str] = None
    invoice_prefix: Optional[str] = None
    default_gst_mode: Optional[str] = None
    default_b2b_gst_rate: Optional[float] = None
    default_retail_gst_rate: Optional[float] = None
