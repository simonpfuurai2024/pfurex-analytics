import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from sqlalchemy import String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from .base import Base

class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    mode: Mapped[str] = mapped_column(String(20))  # "deterministic" or "monte-carlo"
    assumptions: Mapped[Dict[str, Any]] = mapped_column(JSON)
    results: Mapped[Dict[str, Any]] = mapped_column(JSON)
    created_by: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
