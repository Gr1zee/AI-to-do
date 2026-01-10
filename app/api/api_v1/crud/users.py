from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence
from app.models import User
from app.schemas.user import UserCreate
from app.auth.utils import hash_password
from fastapi import HTTPException, status


async def get_all_users(session: AsyncSession) -> Sequence[User]:
    stmt = select(User).order_by(User.id)
    result = await session.scalars(stmt)
    return result.all()


async def create_user(session: AsyncSession, user_create: UserCreate) -> User:
    # ensure email is unique
    existing = await get_user_by_email(session, user_create.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # hash plain password on server
    hashed = hash_password(user_create.password)
    payload = user_create.model_dump()
    payload.pop("password", None)
    user = User(**payload, hashed_password=hashed)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    """Return User model or None for given email."""
    stmt = select(User).where(User.email == email)
    result = await session.scalar(stmt)
    return result


async def get_user_by_id(session: AsyncSession, user_id: int) -> User | None:
    """Return User model or None for given id."""
    stmt = select(User).where(User.id == user_id)
    result = await session.scalar(stmt)
    return result
