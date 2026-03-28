import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db
from app.routes import health, auth, reflections, insights, micro_actions, ai, tasks
from app.background.scheduler import start_scheduler

app = FastAPI(title="Witness AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(reflections.router)
app.include_router(insights.router)
app.include_router(micro_actions.router)
app.include_router(ai.router)
app.include_router(tasks.router)

@app.on_event("startup")
async def startup_event():
    await init_db()
    start_scheduler()

@app.get("/")
async def root():
    return {"message": "Witness AI backend is running"}
