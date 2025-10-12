from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    questions_path: str = "/app/data/test-questions.json"
    submissions_path: str = "app/data/test-submission.json"
    database_url: str = "postgresql://postgres:root@localhost:5432/stem_db"
    
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