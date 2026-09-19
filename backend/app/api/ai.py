import os
import json
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.ai_extraction import AiExtraction
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.ai import AiExtractResponse, ExtractedInvoiceData, AiChatQueryRequest, AiChatQueryResponse
from app.services.ai_service import extract_invoice_from_file, answer_business_query
from app.services.storage_service import storage_service

router = APIRouter()

ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/extract-invoice", response_model=AiExtractResponse)
async def extract_invoice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Check mime type
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_MIME_TYPES and not file.filename.lower().endswith(('.pdf', '.jpg', '.jpeg', '.png')):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a PDF, PNG, or JPG invoice document."
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds maximum 10MB limit")

    # Save to storage
    saved_path = storage_service.save_file(content, file.filename, subfolder="uploads")

    # Call AI Extraction Service
    try:
        extracted_data = await extract_invoice_from_file(content, file.filename, content_type)
        confidence = 0.96
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Invoice extraction failed: {str(e)}")

    # Record in database
    extraction_record = AiExtraction(
        file_name=file.filename,
        file_path=saved_path,
        file_type=content_type,
        status="completed",
        extracted_data=json.dumps(extracted_data),
        confidence_score=confidence
    )
    db.add(extraction_record)
    
    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="AI_EXTRACT",
        entity="AI_EXTRACTION",
        entity_id=str(extraction_record.id or 0),
        details=f"AI extracted invoice data from {file.filename}"
    )
    db.add(audit)
    db.commit()
    db.refresh(extraction_record)

    return AiExtractResponse(
        success=True,
        extraction_id=extraction_record.id,
        file_name=file.filename,
        data=ExtractedInvoiceData(**extracted_data),
        confidence_score=confidence,
        message="Invoice parsed successfully. You can review and edit values before creating the order."
    )

@router.post("/chat-query", response_model=AiChatQueryResponse)
async def chat_business_query(
    query_req: AiChatQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    result = await answer_business_query(db, query_req.query)
    
    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="AI_QUERY",
        entity="AI",
        entity_id=None,
        details=f"AI Business Query: '{query_req.query}' -> Action: {result.get('action_taken')}"
    )
    db.add(audit)
    db.commit()

    return AiChatQueryResponse(
        query=result["query"],
        answer=result["answer"],
        action_taken=result["action_taken"],
        data=result["data"]
    )
