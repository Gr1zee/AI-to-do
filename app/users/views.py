from fastapi import APIRouter
from app.users.schemas import CreateUser
from app.users import crud

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/")
def create_user(user: CreateUser):
    return crud.create_user(user_in=user)
