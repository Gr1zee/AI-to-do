from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.api_v1.endpoints.users import get_all_users
from app.models import db_helper
from app.schemas.user import UserRead, UserCreate
from typing import Annotated
from app.api.api_v1.endpoints.users import create_user as create_one_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserRead])
async def get_users(
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
):
    users = await get_all_users(session=session)
    return users


@router.post("", response_model=UserRead)
async def create_user(
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
    user_create: UserCreate,
):
    user = await create_one_user(session=session, user_create=user_create)
    return user
