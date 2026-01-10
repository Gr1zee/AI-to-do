from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence
from app.models import Project
from app.schemas.project import ProjectCreate


async def get_all_projects(session: AsyncSession, user_id: int) -> Sequence[Project]:
    """Получить все проекты пользователя"""
    stmt = select(Project).where(Project.user_id == user_id).order_by(Project.id)
    result = await session.scalars(stmt)
    return result.all()


async def create_project(session: AsyncSession, project_create: ProjectCreate, user_id: int) -> Project:
    project = Project(**project_create.model_dump(), user_id=user_id)
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project

async def delete_project(session: AsyncSession, project_id: int, user_id: int) -> Project | None:
    stmt = select(Project).where(Project.id == project_id, Project.user_id == user_id)
    result = await session.scalars(stmt)
    project = result.first()
    if project:
        await session.delete(project)
        await session.commit()
    return project


async def get_project_by_id(session: AsyncSession, project_id: int, user_id: int) -> Project | None:
    """Получить проект по ID с проверкой прав доступа"""
    stmt = select(Project).where(Project.id == project_id, Project.user_id == user_id)
    result = await session.scalars(stmt)
    return result.first()
