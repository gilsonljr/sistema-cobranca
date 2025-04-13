from app.core.config import Settings

class TestSettings(Settings):
    # Use SQLite for testing
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./test.db"
    
    # Test-specific settings
    TESTING: bool = True
    
    # Override other settings for testing
    SECRET_KEY: str = "test-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 120
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 24
    
    # Webhook settings
    WEBHOOK_SECRET: str = "test-webhook-secret"
    
    # Correios API
    CORREIOS_API_URL: str = "https://api.correios.com.br"
    CORREIOS_API_KEY: str = "test-correios-api-key"
    
    # CORS Settings
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]
    
    # Logging
    LOG_LEVEL: str = "INFO"

test_settings = TestSettings()
