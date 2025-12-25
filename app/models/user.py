from app.models.base import Base
from sqlalchemy.orm import mapped_column, Mapped
from datetime import datetime, timezone
from sqlalchemy import String, DateTime


class User(Base):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String(100))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_password: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
