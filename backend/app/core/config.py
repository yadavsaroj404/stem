from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path


class Settings(BaseSettings):
    # Get the absolute path to the project root (backend folder)
    project_root: Path = Path(__file__).parent.parent.parent
    
    questions_path: str = "app/data/test-questions.json"
    submissions_path: str = "app/data/test-submission.json"
    LOGS_DIR: str = "logs"
    database_url: str = "postgresql://postgres:TrtNJenvDklANjSIStRrrGMTyaCJsDau@switchyard.proxy.rlwy.net:31926/railway"
    # database_url: str = "postgresql://postgres:root@localhost:5432/stem_db"
    
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