from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from pydantic import EmailStr
from app.schemas.enums import ProjectRole


class ProjectBase(BaseModel):
    name: str
    description: str | None

    model_config = {"from_attributes": True}


class ProjectCreate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    id: int
    user_id: int
    owner_email: str | None = None


class Project(ProjectBase):
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class ProjectMemberCreate(BaseModel):
    email: EmailStr
    role: ProjectRole

    model_config = {"from_attributes": True}

class ProjectMemberRead(BaseModel):
    id: int
    user_id: int
    email: EmailStr
    role: ProjectRole
    added_at: datetime

    model_config = {"from_attributes": True}

class ProjectMemberUpdate(BaseModel):
    role: ProjectRole

    model_config = {"from_attributes": True}

class ProjectMemberDelete(BaseModel):
    email: EmailStr

    model_config = {"from_attributes": True}