from app.models.project import Project
from app.models.project_members import ProjectMember
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.enums import ProjectRole


def is_project_owner(project: Project, user_id: int) -> bool:
    """Проверить, является ли пользователь владельцем проекта"""
    return project.user_id == user_id


async def get_project_by_id_no_check(
    session: AsyncSession, project_id: int
) -> Project | None:
    """Получить проект по ID (без проверки прав)"""
    stmt = select(Project).where(Project.id == project_id)
    result = await session.scalars(stmt)
    return result.first()


async def get_user_role(
    session: AsyncSession, project_id: int, user_id: int
) -> str | None:
    """
    Получить роль пользователя в проекте.
    Возвращает: 'owner' / 'editor' / 'viewer' / None
    """
    # Сначала проверяем, владелец ли
    project = await get_project_by_id_no_check(session, project_id)
    if not project:
        return None
    if project.user_id == user_id:
        return "owner"

    # Проверяем в project_members
    stmt = select(ProjectMember).where(
        ProjectMember.project_id == project_id, ProjectMember.user_id == user_id
    )
    result = await session.scalars(stmt)
    project_member = result.first()

    return project_member.role if project_member else None


async def can_view_project(
    session: AsyncSession, project_id: int, user_id: int
) -> bool:
    """Может ли пользователь просматривать проект (owner/editor/viewer)"""
    role = await get_user_role(session, project_id, user_id)
    return role is not None


async def can_edit_project(
    session: AsyncSession, project_id: int, user_id: int
) -> bool:
    """Может ли пользователь редактировать проект (owner/editor)"""
    role = await get_user_role(session, project_id, user_id)
    return role in ("owner", ProjectRole.EDITOR.value)


async def can_manage_members(
    session: AsyncSession, project_id: int, user_id: int
) -> bool:
    """Может ли пользователь управлять участниками (только owner)"""
    role = await get_user_role(session, project_id, user_id)
    return role == "owner"
