from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence
from app.models import Project
from app.schemas.project import ProjectCreate


async def get_all_users(session: AsyncSession) -> Sequence[Project]:
    stmt = select(Project).order_by(Project.id)
    result = await session.scalars(stmt)
    return result.all()


async def create_user(session: AsyncSession, project_create: ProjectCreate) -> Project:
    project = Project(**project_create.model_dump())
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project
