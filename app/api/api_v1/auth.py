from fastapi import APIRouter
from app.schemas.user import UserRead, UserProfile
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from app.api.api_v1.crud.auth import (
    get_current_auth_user,
    authenticate_user,
    get_login_credentials,
)
from app.auth.utils import encode_jwt
from app.api.api_v1.crud.auth import TokenInfo

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenInfo)
async def login(creds: dict = Depends(get_login_credentials)):
    user = authenticate_user(creds.get("email"), creds.get("password"))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    jwt_payload = {
        "sub": str(user.id),
        "name": user.name,
        "email": user.email
    }
    token = encode_jwt(jwt_payload)
    return TokenInfo(access_token=token, token_type="Bearer")


@router.get("/users/me", response_model=UserProfile)
def auth_user_check(current_user: UserRead = Depends(get_current_auth_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
    }