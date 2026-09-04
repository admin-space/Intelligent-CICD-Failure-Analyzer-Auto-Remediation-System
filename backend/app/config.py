# Configuration Schema for CloudWise AI Backend
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # System settings
    PROJECT_NAME: str = "CloudWise AI"
    ENVIRONMENT: str = "development"
    DEMO_MODE: bool = False # If True, will mock AWS calls if credentials not present
    
    # DB Configurations - SQLite fallback if Postgres is not running
    DATABASE_URL: str = "sqlite:///./cloudwise.db"
    
    # AWS Integration Credentials
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_DEFAULT_REGION: str = "us-east-1"
    AWS_SESSION_TOKEN: Optional[str] = None
    AWS_ROLE_ARN: Optional[str] = None
    
    # JWT Auth Configs
    SECRET_KEY: str = "SUPER_SECRET_TOKEN_CHANGE_ME_IN_PRODUCTION_FINOPS"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # AI & Vector Settings
    AI_PROVIDER: str = "local" # options: local, openai, llama
    OPENAI_API_KEY: Optional[str] = None
    LLAMA_API_KEY: Optional[str] = None
    VECTOR_DB_PATH: str = "./chroma_db"
    
    # Alert Hooks Configuration
    SLACK_WEBHOOK_URL: Optional[str] = None
    DISCORD_WEBHOOK_URL: Optional[str] = None
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
