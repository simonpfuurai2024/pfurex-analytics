import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from sqlalchemy import String, Integer, Text, DateTime, Numeric, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .base import Base

class Valuation(Base):
    __tablename__ = "valuations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE")
    )
    method: Mapped[str] = mapped_column(String(50))
    calculated_value_usd: Mapped[float] = mapped_column(Numeric(18, 2))
    pre_money_usd: Mapped[Optional[float]] = mapped_column(Numeric(18, 2))
    post_money_usd: Mapped[Optional[float]] = mapped_column(Numeric(18, 2))
    assumptions: Mapped[Dict[str, Any]] = mapped_column(JSON)
    output_details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    performed_by: Mapped[Optional[str]] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    company: Mapped["Company"] = relationship(back_populates="valuations")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE")
    )
    overall_score: Mapped[Optional[int]] = mapped_column(Integer)
    category_scores: Mapped[Dict[str, Any]] = mapped_column(JSON)
    assessment_notes: Mapped[Optional[str]] = mapped_column(Text)
    assessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    company: Mapped["Company"] = relationship(back_populates="risk_assessments")
