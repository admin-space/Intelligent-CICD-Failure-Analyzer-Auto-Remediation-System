# Configuration Schema for CloudWise AI Backend
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # System settings
    PROJECT_NAME: str = "CloudWise AI"
    ENVIRONMENT: str = "development"
    DEMO_MODE: bool = True
    
    # DB Configurations
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/cloudwise"
    
    # JWT Auth Configs
    SECRET_KEY: str = "SUPER_SECRET_TOKEN_CHANGE_ME_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # AI & Vector Settings
    AI_PROVIDER: str = "local" # options: local, openai, llama
    OPENAI_API_KEY: Optional[str] = None
    LLAMA_API_KEY: Optional[str] = None
    VECTOR_DB_PATH: str = "./chroma_db"
    
    # Alert Hooks Configuration
    SLACK_WEBHOOK_URL: Optional[str] = None
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
