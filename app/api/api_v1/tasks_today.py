from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.api_v1.crud.tasks import get_today_tasks_for_user
from app.models import db_helper
from app.schemas.task import TaskRead
from app.api.api_v1.crud.auth import get_current_auth_user
from app.schemas.user import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/today", response_model=list[TaskRead])
async def get_tasks_today(
    session: AsyncSession = Depends(db_helper.session_getter),
    current_user: User = Depends(get_current_auth_user),
):
    """Получить все задачи текущего пользователя, срок по которым — сегодня."""
    tasks = await get_today_tasks_for_user(session=session, user_id=current_user.id)
    return tasks
