from app.core.models.base import Base
from sqlalchemy.orm import mapped_column, Mapped


class User(Base):
    __tablename__ = "users"
    username: Mapped[str] = mapped_column(unique=True)
