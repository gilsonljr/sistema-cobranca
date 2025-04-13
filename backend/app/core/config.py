from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Sistema de Cobrança Inteligente"

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "billing_system"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 24  # 24 hours

    # Webhook
    WEBHOOK_SECRET: str = "your-webhook-secret"  # Change in production

    # Correios API
    CORREIOS_API_URL: str = "https://api.correios.com.br"
    CORREIOS_API_KEY: Optional[str] = None

    # CORS Settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        case_sensitive = True
        env_file = ".env"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.SQLALCHEMY_DATABASE_URI:
            self.SQLALCHEMY_DATABASE_URI = (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
            )

settings = Settings()