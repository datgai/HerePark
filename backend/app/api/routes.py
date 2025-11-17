from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.get("/stats")
async def get_stats():
    return {
        "message": "Stats endpoint - will be populated with detection data"
    }
