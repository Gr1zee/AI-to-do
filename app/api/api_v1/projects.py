from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from typing import Annotated

from app.models import db_helper
from app.schemas.project import (
    ProjectRead,
    ProjectCreate,
    ProjectMemberCreate,
    ProjectMemberRead,
    ProjectMemberUpdate,
)
from app.schemas.user import User
from app.api.api_v1.crud.auth import get_current_auth_user
from app.api.api_v1.crud.projects import (
    get_all_projects,
    create_project as create_one_project,
    delete_project as delete_one_project,
)
from app.api.api_v1.crud.project_members import (
    add_member,
    remove_member,
    get_project_members as get_members_crud,
    update_member_role,
)
from app.api.api_v1.crud.permissions import (
    can_manage_members,
    can_view_project,
)
from app.api.api_v1.crud.users import get_user_by_email


router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=list[ProjectRead])
async def get_projects(
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
    current_user: User = Depends(get_current_auth_user),
):
    """Получить все проекты пользователя (свои + где участник)"""
    projects = await get_all_projects(session=session, user_id=current_user.id)
    
    # Добавляем email владельца для каждого проекта
    result = []
    for project in projects:
        owner = await get_user_by_id(session, project.user_id)
        result.append({
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "user_id": project.user_id,
            "owner_email": owner.email if owner else None,
        })
    return result


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
    project_create: ProjectCreate,
    current_user: User = Depends(get_current_auth_user),
):
    """Создать новый проект"""
    project = await create_one_project(
        session=session, project_create=project_create, user_id=current_user.id
    )
    return project


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
    current_user: User = Depends(get_current_auth_user),
):
    """Удалить проект (только владелец)"""
    result = await delete_one_project(
        session=session, project_id=project_id, user_id=current_user.id
    )
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or you don't have permission to delete it",
        )
    return {"detail": "Project deleted successfully"}


# ═══════════════════════════════════════════════════════════════
# Эндпоинты для управления участниками проекта
# ═══════════════════════════════════════════════════════════════


@router.post("/{project_id}/members", status_code=status.HTTP_201_CREATED)
async def add_project_member(
    project_id: int,
    member_data: ProjectMemberCreate,
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
    current_user: User = Depends(get_current_auth_user),
):
    """Добавить участника в проект (только владелец)"""
    # Проверка прав
    if not await can_manage_members(session, project_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can add members",
        )
    
    # Нельзя добавить себя
    if current_user.email == member_data.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot add yourself as a member",
        )
    
    # Найти пользователя по email
    user_to_add = await get_user_by_email(session, member_data.email)
    if user_to_add is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email {member_data.email} not found",
        )
    
    # Добавить участника
    try:
        member = await add_member(
            session,
            project_id=project_id,
            user_id=user_to_add.id,
            role=member_data.role.value,
        )
        return {"detail": "Member added successfully", "member_id": member.id}
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this project",
        )


@router.get("/{project_id}/members", response_model=list[ProjectMemberRead])
async def list_project_members(
    project_id: int,
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
    current_user: User = Depends(get_current_auth_user),
):
    """Получить список участников проекта"""
    # Проверка прав на просмотр
    if not await can_view_project(session, project_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this project",
        )
    
    members = await get_members_crud(session=session, project_id=project_id)
    
    # Преобразуем в формат ответа с email и user_id
    result = []
    for member in members:
        # Загружаем user через relationship или отдельный запрос
        user = await get_user_by_id(session, member.user_id)
        result.append({
            "id": member.id,
            "user_id": member.user_id,
            "email": user.email if user else "unknown",
            "role": member.role,
            "added_at": member.added_at,
        })
    return result


@router.delete("/{project_id}/members/{user_id}")
async def remove_project_member(
    project_id: int,
    user_id: int,
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
    current_user: User = Depends(get_current_auth_user),
):
    """Удалить участника из проекта (только владелец)"""
    # Проверка прав
    if not await can_manage_members(session, project_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can remove members",
        )
    
    # Нельзя удалить себя (владельца)
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove yourself from the project",
        )
    
    member = await remove_member(session, user_id=user_id, project_id=project_id)
    if member is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this project",
        )
    return {"detail": "Member removed successfully"}


@router.patch("/{project_id}/members/{user_id}")
async def update_project_member_role(
    project_id: int,
    user_id: int,
    update_data: ProjectMemberUpdate,
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
    current_user: User = Depends(get_current_auth_user),
):
    """Изменить роль участника (только владелец)"""
    # Проверка прав
    if not await can_manage_members(session, project_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only project owner can change member roles",
        )
    
    member = await update_member_role(
        session, user_id=user_id, project_id=project_id, new_role=update_data.role.value
    )
    if member is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this project",
        )
    return {"detail": "Member role updated successfully"}


# Вспомогательная функция
async def get_user_by_id(session: AsyncSession, user_id: int):
    from app.models import User as UserModel
    from sqlalchemy import select
    stmt = select(UserModel).where(UserModel.id == user_id)
    result = await session.scalars(stmt)
    return result.first()