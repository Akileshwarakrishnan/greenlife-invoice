from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from app.core.database import Base

class AiExtraction(Base):
    __tablename__ = "ai_extractions"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    status = Column(String(50), default="completed")  # processing, completed, failed
    extracted_data = Column(Text, nullable=False)  # JSON string of structured data
    confidence_score = Column(Float, default=0.95)
    correction_notes = Column(Text, nullable=True)
    created_order_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
