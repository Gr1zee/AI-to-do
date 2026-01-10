from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence
from app.models import Task
from app.schemas.task import TaskCreate


async def get_project_tasks(session: AsyncSession, project_id: int) -> Sequence[Task]:
    """Получить все задачи проекта"""
    stmt = select(Task).where(Task.project_id == project_id).order_by(Task.id)
    result = await session.scalars(stmt)
    return result.all()


async def get_all_tasks(session: AsyncSession) -> Sequence[Task]:
    stmt = select(Task).order_by(Task.id)
    result = await session.scalars(stmt)
    return result.all()


async def create_task(session: AsyncSession, task_create: TaskCreate, user_id: int, project_id: int) -> Task:
    task = Task(**task_create.model_dump(), user_id=user_id, project_id=project_id)
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task


async def delete_task(session: AsyncSession, task_id: int, user_id: int) -> Task | None:
    """Удалить задачу с проверкой прав доступа"""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.scalars(stmt)
    task = result.first()
    if task:
        await session.delete(task)
        await session.commit()
    return task


async def update_task(session: AsyncSession, task_id: int, user_id: int, task_update: dict) -> Task | None:
    """Обновить задачу с проверкой прав доступа"""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.scalars(stmt)
    task = result.first()
    if task:
        for key, value in task_update.items():
            if value is not None:
                setattr(task, key, value)
        await session.commit()
        await session.refresh(task)
    return task