from fastapi import APIRouter

router = APIRouter(prefix="/tasks")


@router.get("/")
def get_tasks():
    return {"task_1": {"title", "descripton", "priority"}}
