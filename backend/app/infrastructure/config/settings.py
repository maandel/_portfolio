import logging

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres_password_123"
    POSTGRES_DB: str = "portfolio_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = ""

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = ""

    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    JWT_SECRET: str = "super_secret_jwt_key_change_me_in_production_1928374"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "your_email@gmail.com"
    SMTP_PASSWORD: str = "your_app_password"
    SMTP_FROM_EMAIL: str = "your_email@gmail.com"
    SMTP_TO_EMAIL: str | None = None
    SMTP_USE_SSL: bool | None = None
    SMTP_USE_STARTTLS: bool = True
    SMTP_TIMEOUT_SECONDS: int = 10
    EMAIL_FALLBACK_TO_FILE: bool = False

    ADMIN_EMAIL: str = "admin@mandell.tech"
    ADMIN_PASSWORD: str | None = None

    ALLOWED_ORIGINS: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        extra="ignore",
    )

    @property
    def use_ssl(self) -> bool:
        if self.SMTP_USE_SSL is not None:
            return self.SMTP_USE_SSL
        return self.SMTP_PORT == 465

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]  # noqa: E501

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"  # noqa: E501


settings = Settings()


logger = logging.getLogger(__name__)
if settings.JWT_SECRET == "super_secret_jwt_key_change_me_in_production_1928374":  # noqa: E501
    logger.warning(
        "SECURITY WARNING: Using default JWT_SECRET. "
        "Overwrite JWT_SECRET in production to protect application "
        "authentication."
    )
