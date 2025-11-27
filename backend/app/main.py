from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import tests, missions, assessments
from app.models.database import create_tables
from app.core.config import settings
from app.core.logging import setup_logging, get_logger

# Initialize logging on module load
setup_logging()

logger = get_logger(__name__)


# Initialize database tables on startup
@asynccontextmanager
async def startup_event(app: FastAPI):
    """Application startup handler"""
    logger.info("Application starting up")

    # Only create tables if database URL is available
    try:
        logger.info("Initializing database tables")
        create_tables()
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error(
            "Database initialization failed",
            extra={
                'error': str(e),
                'error_type': type(e).__name__
            },
            exc_info=True
        )

    yield

    # Shutdown
    logger.info("Application shutting down")
    

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
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

# Include routers
# Legacy endpoints (kept for backward compatibility)
app.include_router(tests.router, tags=["tests-legacy"])
app.include_router(missions.router, prefix="/api", tags=["missions-legacy"])

# New unified assessment endpoint
app.include_router(assessments.router, prefix="/api", tags=["assessments"])

logger.info(
    "Application configured",
    extra={
        'cors_origins': ["https://stem-frontend-teal.vercel.app", "http://localhost:3000", "http://192.168.1.2:8000"],
        'api_version': "1.0.0"
    }
)

# add "this is backend" route for '/'
@app.get("/")
async def read_root():
    return {"message": "This is the backend for Career Assessment API"}
