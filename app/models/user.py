from app.models.base import Base
from sqlalchemy.orm import mapped_column, Mapped, relationship
from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from typing import List
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.task import Task
    from app.models.project_members import ProjectMember


class User(Base):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # relationships
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="user")
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="user")
    project_memberships: Mapped[List["ProjectMember"]] = relationship(
        "ProjectMember", back_populates="user", cascade="all, delete-orphan"
    )
