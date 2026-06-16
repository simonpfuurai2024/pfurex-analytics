import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from sqlalchemy import String, Integer, Text, Date, DateTime, Numeric, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .base import Base

class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_currency: Mapped[str] = mapped_column(String(10))
    to_currency: Mapped[str] = mapped_column(String(10), default="USD")
    rate: Mapped[float] = mapped_column(Numeric(18, 6))
    source: Mapped[Optional[str]] = mapped_column(String(50))
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    valid_to: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    legal_name: Mapped[Optional[str]] = mapped_column(String(255))
    registration_number: Mapped[Optional[str]] = mapped_column(String(100))
    sector: Mapped[Optional[str]] = mapped_column(String(100))
    founded_year: Mapped[Optional[int]] = mapped_column(Integer)
    country: Mapped[str] = mapped_column(String(100), default="Zimbabwe")
    description: Mapped[Optional[str]] = mapped_column(Text)
    stage: Mapped[Optional[str]] = mapped_column(String(50))
    primary_contact: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    owner: Mapped[Optional["User"]] = relationship(
        "User", back_populates="owned_companies", foreign_keys=[owner_id]
    )

    documents: Mapped[list["Document"]] = relationship(back_populates="company")
    financial_records: Mapped[list["FinancialRecord"]] = relationship(back_populates="company")
    valuations: Mapped[list["Valuation"]] = relationship(back_populates="company")
    risk_assessments: Mapped[list["RiskAssessment"]] = relationship(back_populates="company")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE")
    )
    title: Mapped[str] = mapped_column(String(255))
    document_type: Mapped[str] = mapped_column(String(50))
    file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    parsed_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    parse_status: Mapped[str] = mapped_column(String(20), default="pending")
    confidence_scores: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)

    company: Mapped["Company"] = relationship(back_populates="documents")
    financial_records: Mapped[list["FinancialRecord"]] = relationship(back_populates="document")


class FinancialRecord(Base):
    __tablename__ = "financial_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE")
    )
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL")
    )
    period_start: Mapped[Optional[datetime]] = mapped_column(Date)
    period_end: Mapped[Optional[datetime]] = mapped_column(Date)
    metric_name: Mapped[str] = mapped_column(String(100))
    amount: Mapped[float] = mapped_column(Numeric(18, 2))
    currency: Mapped[str] = mapped_column(String(10))
    usd_equivalent: Mapped[Optional[float]] = mapped_column(Numeric(18, 2))
    exchange_rate_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("exchange_rates.id")
    )
    is_estimate: Mapped[bool] = mapped_column(Boolean, default=False)
    extracted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    company: Mapped["Company"] = relationship(back_populates="financial_records")
    document: Mapped[Optional["Document"]] = relationship(back_populates="financial_records")
    exchange_rate: Mapped[Optional["ExchangeRate"]] = relationship()
