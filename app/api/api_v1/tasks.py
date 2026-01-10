from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter(prefix="/projects", tags=["Tasks"])
from app.api.api_v1.crud.tasks import (
    get_project_tasks,
    create_task,
    delete_task,
    update_task,
)
from app.api.api_v1.crud.projects import get_project_by_id
from app.models import db_helper
from app.schemas.task import TaskRead, TaskCreate, TaskUpdate
from typing import Annotated
from app.schemas.user import User
from app.api.api_v1.crud.auth import get_current_auth_user


async def get_current_project(
    project_id: int,
    session: AsyncSession,
    current_user: User,
) -> int:
    """Получить текущий проект с проверкой прав доступа"""
    project = await get_project_by_id(session=session, project_id=project_id, user_id=current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project_id


@router.get("/{project_id}/tasks", response_model=list[TaskRead])
async def get_tasks(
    project_id: int = Path(..., gt=0),
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)] = None,
    current_user: User = Depends(get_current_auth_user),
):
    """Получить все задачи проекта"""
    # Проверяем, что проект принадлежит пользователю
    await get_current_project(project_id=project_id, session=session, current_user=current_user)
    tasks = await get_project_tasks(session=session, project_id=project_id)
    return tasks


@router.post("/{project_id}/tasks", response_model=TaskRead)
async def create_task_endpoint(
    project_id: int = Path(..., gt=0),
    task_create: TaskCreate = None,
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)] = None,
    current_user: User = Depends(get_current_auth_user),
):
    """Создать новую задачу в проекте"""
    # Проверяем, что проект принадлежит пользователю
    await get_current_project(project_id=project_id, session=session, current_user=current_user)
    task = await create_task(session=session, task_create=task_create, user_id=current_user.id, project_id=project_id)
    return task


@router.delete("/{project_id}/tasks/{task_id}", response_model=dict)
async def delete_task_endpoint(
    project_id: int = Path(..., gt=0),
    task_id: int = Path(..., gt=0),
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)] = None,
    current_user: User = Depends(get_current_auth_user),
):
    """Удалить задачу"""
    # Проверяем, что проект принадлежит пользователю
    await get_current_project(project_id=project_id, session=session, current_user=current_user)
    if await delete_task(session=session, task_id=task_id, user_id=current_user.id) is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"detail": "Task deleted successfully"}


@router.patch("/{project_id}/tasks/{task_id}", response_model=TaskRead)
async def update_task_endpoint(
    project_id: int = Path(..., gt=0),
    task_id: int = Path(..., gt=0),
    task_update: TaskUpdate = None,
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)] = None,
    current_user: User = Depends(get_current_auth_user),
):
    """Обновить задачу"""
    # Проверяем, что проект принадлежит пользователю
    await get_current_project(project_id=project_id, session=session, current_user=current_user)
    updated_task = await update_task(
        session=session, 
        task_id=task_id, 
        user_id=current_user.id,
        task_update=task_update.model_dump(exclude_unset=True)
    )
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task