import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Numeric, DateTime, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base

class SectorBaseline(Base):
    __tablename__ = "sector_baselines"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sector: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    stage: Mapped[str] = mapped_column(String(50), nullable=False, default="Seed")
    baseline_usd: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    source: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ExitMultiple(Base):
    __tablename__ = "exit_multiples"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sector: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    stage: Mapped[str] = mapped_column(String(50), nullable=False, default="Seed")
    multiple: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    source: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class RiskAdjustmentRule(Base):
    """Stores per‑category, per‑score percentage adjustments for risk‑adjusted valuation."""
    __tablename__ = "risk_adjustment_rules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category: Mapped[str] = mapped_column(String(50), nullable=False)   # e.g. "policy_regulatory"
    score: Mapped[int] = mapped_column(Integer, nullable=False)         # 1‑10
    adjustment_pct: Mapped[int] = mapped_column(Integer, nullable=False) # e.g. 15 means +15%, -10 means -10%
    description: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
