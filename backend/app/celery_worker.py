# Forwarder file to preserve docker-compose.yml task runner reference
from app.infrastructure.celery.worker import celery_app
from app.infrastructure.celery.tasks import send_otp_email_task, send_contact_email_task
