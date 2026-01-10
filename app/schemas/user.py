from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from app.schemas.project import ProjectRead
from pydantic import ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    name: str

    model_config = {"from_attributes": True}


class UserCreate(UserBase):
    # accept plain password from client; server will hash it
    password: str


class UserRead(UserBase):
    id: int


class UserProfile(BaseModel):
    id: int
    email: EmailStr
    name: str

    model_config = {"from_attributes": True}


class User(UserBase):
    model_config = ConfigDict(strict=True)

    email: EmailStr
    name: str 
    hashed_password: bytes
    projects: Optional[List[ProjectRead]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
