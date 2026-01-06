from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.api_v1.crud.projects import get_all_projects
from app.models import db_helper
from app.schemas.project import ProjectRead, ProjectCreate
from typing import Annotated
from app.api.api_v1.crud.projects import create_project as create_one_project

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
):
    project = await create_one_project(session=session, project_create=project_create)
    return project
