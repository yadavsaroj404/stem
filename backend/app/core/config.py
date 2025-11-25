from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
import os
from pathlib import Path


class Settings(BaseSettings):
    # Get the absolute path to the project root (backend folder)
    project_root: Path = Path(__file__).parent.parent.parent

    questions_path: str = "app/data/test-questions.json"
    submissions_path: str = "app/data/test-submission.json"
    database_url: str  # Must be provided via environment variable

    # Logging configuration
    LOGS_DIR: str = "logs"
    log_level: str = "INFO"
    log_format: str = "dev"  # 'json' for production, 'dev' for development
    log_file: Optional[str] = None  # Optional: path to log file
    
    @property
    def questions_absolute_path(self) -> str:
        """Get absolute path for questions file"""
        return str(self.project_root / self.questions_path)
    
    @property
    def submissions_absolute_path(self) -> str:
        """Get absolute path for submissions file"""
        return str(self.project_root / self.submissions_path)
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

@lru_cache()
def get_settings():
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()