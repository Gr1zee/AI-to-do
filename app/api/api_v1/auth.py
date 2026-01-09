from typing import Annotated
from fastapi import APIRouter
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi import Depends


router = APIRouter(prefix="/auth", tags=["Authentication"])

security = HTTPBasic()

@router.get("/auth")
def authenticate_user(
    credentials: Annotated[HTTPBasicCredentials, Depends(security)],
):
    return {"message": "Authentication endpoint",
            "username": credentials.username,
            "password": credentials.password}