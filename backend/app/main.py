from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes, websockets

app = FastAPI(title="HerePark Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api")
app.include_router(websockets.router)

@app.get("/")
async def root():
    return {"message": "HerePark API Running"}