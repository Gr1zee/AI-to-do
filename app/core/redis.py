from redis.asyncio import Redis, from_url
from typing import Optional
from app.core.config import settings


class RedisClient:
    """Redis client wrapper for async operations"""

    _instance: Optional[Redis] = None

    @classmethod
    async def get_client(cls) -> Redis:
        """Get or create Redis client"""
        if cls._instance is None:
            cls._instance = await from_url(
                settings.redis.url, encoding="utf8", decode_responses=True
            )
        return cls._instance

    @classmethod
    async def close(cls) -> None:
        """Close Redis connection"""
        if cls._instance is not None:
            await cls._instance.close()
            cls._instance = None


async def get_redis() -> Redis:
    """Dependency for getting Redis client"""
    return await RedisClient.get_client()
