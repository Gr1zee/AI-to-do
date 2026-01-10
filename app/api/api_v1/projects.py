from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.api_v1.crud.projects import get_all_projects
from app.models import db_helper
from app.schemas.project import ProjectRead, ProjectCreate
from typing import Annotated
from app.api.api_v1.crud.projects import create_project as create_one_project
from app.schemas.user import User
from app.api.api_v1.crud.auth import get_current_auth_user

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=list[ProjectRead])
async def get_projects(
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
):
    projects = await get_all_projects(session=session)
    return projects


@router.post("", response_model=ProjectRead)
async def create_project(
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
    project_create: ProjectCreate,
    current_user: User = Depends(get_current_auth_user)
):
    project = await create_one_project(session=session, project_create=project_create, user_id=current_user.id)
    return project
