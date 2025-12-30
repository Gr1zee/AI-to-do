from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ProjectBase(BaseModel):
    user_id: int
    name: str
    description: str | None

    model_config = {"from_attributes": True}


class ProjectCreate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    id: int


class Project(ProjectBase):
    created_at: datetime
    updated_at: Optional[datetime] = None
