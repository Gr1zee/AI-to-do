from app.models.base import Base
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import ForeignKey, Integer, DateTime, String, UniqueConstraint
from datetime import datetime, timezone
from typing import TYPE_CHECKING
import enum

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.project import Project


class ProjectRole(str, enum.Enum):
    EDITOR = "editor"
    VIEWER = "viewer"


class ProjectMember(Base):
    __tablename__ = "project_members"
    __table_args__ = (
        UniqueConstraint("project_id", "user_id", name="uq_project_member"),
    )

    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(20), default=ProjectRole.VIEWER.value)
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship("User", back_populates="project_memberships")
    project: Mapped["Project"] = relationship("Project", back_populates="memberships")