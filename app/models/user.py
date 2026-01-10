from app.models.base import Base
from sqlalchemy.orm import mapped_column, Mapped, relationship
from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from typing import List
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.project import Project


class User(Base):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # relarionships
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="user")
