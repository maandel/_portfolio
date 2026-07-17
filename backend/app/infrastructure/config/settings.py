import logging

from pydantic import model_validator
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
    BREVO_API_KEY: str | None = None
    BREVO_SENDER_EMAIL: str | None = None
    BREVO_CONTACT_TO_EMAIL: str | None = None

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

    @model_validator(mode="after")
    def configure_services(self) -> "Settings":
        # 1. Clean up placeholder BREVO_API_KEY if present
        if self.BREVO_API_KEY:
            key_stripped = self.BREVO_API_KEY.strip()
            if not key_stripped or "xxxxxx" in key_stripped:
                self.BREVO_API_KEY = None
            else:
                self.BREVO_API_KEY = key_stripped

        # 2. Validate Brevo config if a real key is present
        if self.BREVO_API_KEY:
            sender = self.BREVO_SENDER_EMAIL or self.SMTP_FROM_EMAIL
            if not sender or "your_email" in sender:
                raise ValueError(
                    "Brevo is enabled (BREVO_API_KEY is set), but sender email is not configured. "
                    "Please set BREVO_SENDER_EMAIL or SMTP_FROM_EMAIL to a valid email address."
                )

            recipient = (
                self.BREVO_CONTACT_TO_EMAIL
                or self.SMTP_TO_EMAIL
                or self.SMTP_FROM_EMAIL
            )
            if not recipient or "your_email" in recipient:
                raise ValueError(
                    "Brevo is enabled (BREVO_API_KEY is set), but contact recipient email is not configured. "
                    "Please set BREVO_CONTACT_TO_EMAIL, SMTP_TO_EMAIL, or SMTP_FROM_EMAIL to a valid email address."
                )

        redis_url = self.REDIS_URL.strip() if self.REDIS_URL else ""

        # If CELERY_BROKER_URL is default/empty and REDIS_URL is set, derive it
        if (
            not self.CELERY_BROKER_URL
            or self.CELERY_BROKER_URL == "redis://localhost:6379/0"
        ):
            if redis_url:
                self.CELERY_BROKER_URL = self._derive_celery_url(redis_url, 0)
            else:
                self.CELERY_BROKER_URL = (
                    f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
                )

        # If CELERY_RESULT_BACKEND is default/empty and REDIS_URL is set, derive it
        if (
            not self.CELERY_RESULT_BACKEND
            or self.CELERY_RESULT_BACKEND == "redis://localhost:6379/1"
        ):
            if redis_url:
                self.CELERY_RESULT_BACKEND = self._derive_celery_url(redis_url, 1)
            else:
                self.CELERY_RESULT_BACKEND = (
                    f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/1"
                )

        return self

    def _derive_celery_url(self, base_url: str, db_index: int) -> str:
        import urllib.parse

        parsed = urllib.parse.urlparse(base_url)
        path = parsed.path.strip("/")
        if path.isdigit():
            new_path = f"/{db_index}"
        else:
            new_path = f"/{path}/{db_index}" if path else f"/{db_index}"

        return urllib.parse.urlunparse(
            (
                parsed.scheme,
                parsed.netloc,
                new_path,
                parsed.params,
                parsed.query,
                parsed.fragment,
            )
        )

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
