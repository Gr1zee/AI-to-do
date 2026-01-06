from fastapi import APIRouter
from app.api.api_v1.users import router as users_router
from app.api.api_v1.projects import router as project_router

router = APIRouter(prefix="/v1")

router.include_router(users_router)
router.include_router(project_router)
