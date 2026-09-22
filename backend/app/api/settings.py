from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_current_active_admin
from app.core.config import settings
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.settings import SystemSettingsOut, BusinessSettingsUpdate

router = APIRouter()

@router.get("", response_model=SystemSettingsOut)
def get_system_settings(current_user: User = Depends(get_current_user)) -> Any:
    return SystemSettingsOut(
        business={
            "business_name": settings.BUSINESS_NAME,
            "business_name_ta": getattr(settings, "BUSINESS_NAME_TA", "கிரீன் லைப் நேச்சுரல் புட்ஸ்"),
            "business_proprietor": getattr(settings, "BUSINESS_PROPRIETOR", "RVS.Arumugam"),
            "business_tagline": settings.BUSINESS_TAGLINE,
            "business_address": settings.BUSINESS_ADDRESS,
            "business_phone": settings.BUSINESS_PHONE,
            "business_email": settings.BUSINESS_EMAIL,
            "business_website": settings.BUSINESS_WEBSITE,
            "business_fssai": getattr(settings, "BUSINESS_FSSAI", "22416495000038"),
            "business_msme": getattr(settings, "BUSINESS_MSME", "TN28D0028521"),
            "business_gstin": settings.BUSINESS_GSTIN,
            "business_bank_name": getattr(settings, "BUSINESS_BANK_NAME", "SBI BRANCH - UDUMALPET"),
            "business_ifsc": getattr(settings, "BUSINESS_IFSC", "SBIN0000944"),
            "business_account_name": getattr(settings, "BUSINESS_ACCOUNT_NAME", "GREEN LIFE NATURAL FOODS"),
            "business_account_number": getattr(settings, "BUSINESS_ACCOUNT_NUMBER", "35949191474"),
            "business_upi_id": settings.BUSINESS_UPI_ID,
            "currency_symbol": settings.CURRENCY_SYMBOL,
            "invoice_prefix": settings.INVOICE_PREFIX,
            "default_gst_mode": getattr(settings, "DEFAULT_GST_MODE", "exempt"),
            "default_b2b_gst_rate": getattr(settings, "DEFAULT_B2B_GST_RATE", 5.0),
            "default_retail_gst_rate": getattr(settings, "DEFAULT_RETAIL_GST_RATE", 0.0),
        },
        automation={
            "n8n_webhook_url": settings.N8N_WEBHOOK_URL,
            "n8n_email_webhook_url": settings.N8N_EMAIL_WEBHOOK_URL,
            "n8n_whatsapp_webhook_url": settings.N8N_WHATSAPP_WEBHOOK_URL,
            "n8n_ai_webhook_url": settings.N8N_AI_WEBHOOK_URL,
            "n8n_api_url": settings.N8N_API_URL,
            "n8n_api_key": "***" if settings.N8N_API_KEY else "",
            "mock_fallback": settings.N8N_MOCK_FALLBACK
        },
        ai={
            "ai_provider": settings.AI_PROVIDER,
            "ai_base_url": settings.AI_BASE_URL,
            "ai_model": settings.AI_MODEL,
            "ai_api_key_configured": bool(settings.AI_API_KEY and settings.AI_API_KEY != "mock-or-set-your-key")
        }
    )

@router.put("/business")
def update_business_settings(
    update_in: BusinessSettingsUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_active_admin)
) -> Any:
    data = update_in.model_dump(exclude_unset=True)
    for k, v in data.items():
        attr_name = k.upper()
        if hasattr(settings, attr_name) and v is not None:
            setattr(settings, attr_name, v)

    audit = AuditLog(
        user_id=admin_user.id,
        user_email=admin_user.email,
        action="UPDATE_SETTINGS",
        entity="SETTINGS",
        entity_id="BUSINESS",
        details="Business profile settings updated"
    )
    db.add(audit)
    db.commit()

    return {"message": "Settings updated successfully"}
