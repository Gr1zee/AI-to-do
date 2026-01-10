from pydantic import BaseModel
from fastapi import Depends, HTTPException, status, Form, Request
from jwt import InvalidTokenError
from app.schemas.user import UserRead
from app.auth import utils as auth
from app.auth.utils import decode_jwt
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import db_helper
from app.api.api_v1.crud.users import get_user_by_email
from fastapi.security import OAuth2PasswordBearer


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class TokenInfo(BaseModel):
    access_token: str
    token_type: str


async def validate_auth_user(
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
    email: str = Form(),
    password: str = Form(),
) -> UserRead:
    """Validate credentials against the database and return a `UserRead` schema on success."""
    user = await get_user_by_email(session, email)
    unaouthorized_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not user:
        raise unaouthorized_exception
    if not auth.validate_password(password, user.hashed_password):
        raise unaouthorized_exception
    return UserRead.model_validate(user)

def get_current_token_payload(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        decoded_token = decode_jwt(token=token)
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token error {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decoded_token


async def get_current_auth_user(
    session: Annotated[AsyncSession, Depends(db_helper.session_getter)],
    payload: dict = Depends(get_current_token_payload),
) -> UserRead:
    email: str | None = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await get_user_by_email(session, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return UserRead.model_validate(user)


async def authenticate_user(session: AsyncSession, email: str, password: str) -> UserRead | None:
    """Return authenticated user as `UserRead` or None."""
    user = await get_user_by_email(session, email)
    if not user:
        return None
    if not auth.validate_password(password, user.hashed_password):
        return None
    return UserRead.model_validate(user)


async def get_login_credentials(request: Request, email: str | None = Form(None), password: str | None = Form(None)) -> dict:
    """Accepts form with (email,password) or form with (username,password) (OAuth2) or JSON body {email,password}."""
    if email and password:
        return {"email": email, "password": password}
    try:
        data = await request.json()
        if isinstance(data, dict) and data.get("email") and data.get("password"):
            return {"email": data.get("email"), "password": data.get("password")}
    except Exception:
        pass
    try:
        form = await request.form()
        username = form.get("username")
        pwd = form.get("password")
        if username and pwd:
            return {"email": username, "password": pwd}
    except Exception:
        pass
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Missing credentials")
