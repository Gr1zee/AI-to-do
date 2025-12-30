from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from app.schemas.project import ProjectRead


class UserBase(BaseModel):
    email: EmailStr
    name: str
    hashed_password: str

    model_config = {"from_attributes": True}


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    id: int


class User(UserBase):
    email: EmailStr
    name: str
    hashed_password: str
    projects: Optional[List[ProjectRead]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
