from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence
from app.models import ProjectMember
from app.schemas.enums import ProjectRole


async def add_member(
    session: AsyncSession, project_id: int, user_id: int, role: str
) -> ProjectMember:
    """Добавить участника в проект"""
    project_member = ProjectMember(project_id=project_id, user_id=user_id, role=role)
    session.add(project_member)
    await session.commit()
    await session.refresh(project_member)
    return project_member


async def get_project_members(
    session: AsyncSession, project_id: int
) -> Sequence[ProjectMember]:
    """Получить всех участников проекта"""
    stmt = (
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id)
        .order_by(ProjectMember.id)
    )
    result = await session.scalars(stmt)
    return result.all()


async def remove_member(
    session: AsyncSession, user_id: int, project_id: int
) -> ProjectMember | None:
    stmt = select(ProjectMember).where(
        ProjectMember.user_id == user_id, ProjectMember.project_id == project_id
    )
    result = await session.scalars(stmt)
    project_member = result.first()
    if project_member:
        await session.delete(project_member)
        await session.commit()
    return project_member


async def update_member_role(
    session: AsyncSession, user_id: int, project_id: int, new_role: str
) -> ProjectMember | None:
    stmt = select(ProjectMember).where(
        ProjectMember.user_id == user_id, ProjectMember.project_id == project_id
    )
    result = await session.scalars(stmt)
    project_member = result.first()
    if project_member:
        project_member.role = new_role
        session.add(project_member)
        await session.commit()
        await session.refresh(project_member)
    return project_member
