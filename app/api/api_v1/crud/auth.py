from pydantic import BaseModel
from fastapi import Depends, HTTPException, status, Form, Request
from jwt import InvalidTokenError
from app.schemas.user import UserRead
from app.auth import utils as auth
from app.auth.utils import decode_jwt
from fastapi.security import OAuth2PasswordBearer


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

john = UserRead(
    id=1,
    email="123@gmail.com",
    name="John Doe",
    hashed_password=auth.hash_password("123")
)

users_db = {
    john.email: john
}

class TokenInfo(BaseModel):
    access_token: str
    token_type: str

def validate_auth_user(email: str = Form(), password: str = Form()) -> UserRead:
    user = users_db.get(email)
    unaouthorized_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not user:
        raise unaouthorized_exception
    if not auth.validate_password(password, user.hashed_password):
        raise unaouthorized_exception
    return user

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


def get_current_auth_user(payload: dict = Depends(get_current_token_payload)) -> UserRead:
    email: str | None = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = users_db.get(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def authenticate_user(email: str, password: str) -> UserRead | None:
    user = users_db.get(email)
    if not user:
        return None
    if not auth.validate_password(password, user.hashed_password):
        return None
    return user


async def get_login_credentials(request: Request, email: str | None = Form(None), password: str | None = Form(None)) -> dict:
    """Accepts form with (email,password) or form with (username,password) (OAuth2) or JSON body {email,password}."""
    # prefer conventional form fields
    if email and password:
        return {"email": email, "password": password}
    # try JSON body
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
