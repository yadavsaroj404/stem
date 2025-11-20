from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import tests
from app.models.database import create_tables
from app.core.logging import logger
import os


# Initialize database tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup...")
    # Only create tables if database URL is available
    try:
        create_tables()
        logger.info("Database tables created or already exist.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}", exc_info=True)
    yield
    logger.info("Application shutdown.")
    

app = FastAPI(
    title="Career Assessment API",
    description="API for career assessment questionnaires and test data",
    version="1.0.0",
    lifespan=lifespan
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
