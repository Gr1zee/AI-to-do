import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.redis import RedisClient

from contextlib import asynccontextmanager

from app.models import db_helper
from app.api import router as api_roter


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    await RedisClient.get_client()  # Initialize Redis connection
    yield
    # shutdown
    await db_helper.dispose()
    await RedisClient.close()  # Close Redis connection


app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],  # frontend dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prefix=settings.api.prefix, router=api_roter)

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app", host=settings.run.host, port=settings.run.port, reload=True
    )
