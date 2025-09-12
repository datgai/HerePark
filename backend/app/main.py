from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow React frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello from FastAPI!"}

@app.get("/api/ping")
async def ping():
    return {"message": "pong"}
