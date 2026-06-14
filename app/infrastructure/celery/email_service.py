from app.domain.interfaces import IEmailService
from app.infrastructure.celery.tasks import (
    send_contact_email_task,
    send_otp_email_task,
)


class CeleryEmailService(IEmailService):
    async def send_otp(self, email: str, otp: str) -> None:
        send_otp_email_task.delay(email, otp)

    async def send_contact_message(
        self,
        name: str,
        email: str,
        message: str,
    ) -> None:
        send_contact_email_task.delay(name, email, message)
