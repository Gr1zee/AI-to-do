import jwt
import bcrypt
from app.core.config import settings
from datetime import datetime, timedelta
from pathlib import Path

def encode_jwt(
    payload: dict,
    key: str | None = None,
    algorithm: str = settings.auth_jwt.algorithm,
    expire_minutes: int = settings.auth_jwt.access_token_expire_minutes,
    expire_timedelta: timedelta | None = None
) -> str:
    if key is None:
        # support either Path or str values in settings
        key = Path(settings.auth_jwt.private_key_path).read_text()
    to_encode = payload.copy()
    # ensure 'sub' claim is a string (some JWT libs require this)
    if 'sub' in to_encode and to_encode['sub'] is not None:
        to_encode['sub'] = str(to_encode['sub'])
    now = datetime.utcnow()
    if expire_timedelta:
        expire = now + expire_timedelta
    else:
        expire = now + timedelta(minutes=expire_minutes)
    to_encode.update(exp=expire, iat=now)

    token = jwt.encode(to_encode, key, algorithm=algorithm)
    return token


def decode_jwt(
    token: str | bytes,
    public_key: str | None = None,
    algorithms: list[str] | None = None
) -> dict:
    if public_key is None:
        public_key = Path(settings.auth_jwt.public_key_path).read_text()
    if algorithms is None:
        algorithms = [settings.auth_jwt.algorithm]
    payload = jwt.decode(token, public_key, algorithms=algorithms)
    return payload

def hash_password(password: str) -> str:
    """Hash a plain password and return a UTF-8 string safe for DB storage."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def validate_password(password: str, hashed_pwd: str | bytes) -> bool:
    """Validate a plain password against a hashed password stored as str or bytes."""
    if isinstance(hashed_pwd, str):
        hashed_pwd = hashed_pwd.encode("utf-8")
    return bcrypt.checkpw(password.encode("utf-8"), hashed_pwd)