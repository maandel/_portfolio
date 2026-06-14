from app.infrastructure.config.settings import settings
from celery import Celery

celery_app = Celery(
    "portfolio_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    imports=["app.infrastructure.celery.tasks"],
)
