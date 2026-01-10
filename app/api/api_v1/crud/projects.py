from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence
from app.models import Project
from app.schemas.project import ProjectCreate


async def get_all_projects(session: AsyncSession) -> Sequence[Project]:
    stmt = select(Project).order_by(Project.id)
    result = await session.scalars(stmt)
    return result.all()


async def create_project(session: AsyncSession, project_create: ProjectCreate, user_id: int) -> Project:
    project = Project(**project_create.model_dump(), user_id=user_id)
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project
