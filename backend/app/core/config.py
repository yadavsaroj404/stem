from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    questions_path: str = "app/data/test-questions.json"
    submissions_path: str = "app/data/test-submission.json"

@lru_cache()
def get_settings():
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()