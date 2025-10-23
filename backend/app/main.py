from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import tests
from app.models.database import create_tables
import os


# Initialize database tables on startup
@asynccontextmanager
async def startup_event(app: FastAPI):
    # Only create tables if database URL is available
    try:
        create_tables()
    except Exception as e:
        print(f"Database initialization error: {e}")
    yield
    

app = FastAPI(
    title="Career Assessment API",
    description="API for career assessment questionnaires and test data",
    version="1.0.0",
    lifespan=startup_event
)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://stem-frontend-teal.vercel.app", "http://localhost:3000", "http://192.168.1.2:8000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tests.router)

# add "this is backend" route for '/'
@app.get("/")
async def read_root():
    return {"message": "This is the backend for Career Assessment API"}
