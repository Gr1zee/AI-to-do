from app.models.base import Base
from sqlalchemy.orm import mapped_column, Mapped, relationship
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, ForeignKey
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User


class Project(Base):
    __tablename__ = "projects"
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # relationships
    user: Mapped["User"] = relationship("User", back_populates="projects")
