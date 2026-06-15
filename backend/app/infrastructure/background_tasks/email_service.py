import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import BackgroundTasks

from app.domain.interfaces import IEmailService
from app.infrastructure.config.settings import settings

logger = logging.getLogger(__name__)


def _send_smtp_message(msg: MIMEMultipart) -> None:
    if settings.SMTP_PORT == 465:
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    else:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)


def send_otp_email_sync(email: str, otp: str) -> str:
    subject = "Mandell Admin - Password Reset OTP"
    body = f"""
    <h2>Password Reset Request</h2>
    <p>You have requested to reset your password. </p>
    <p>Use the secure 6-digit OTP below to proceed:</p>
    <div style="background-color: #f3f4f6; padding: 15px; text-align:
    center; font-size: 24px; font-weight: bold;
    letter-spacing: 5px; color: #1f2937; border-radius: 8px; margin: 20px 0;">
        {otp}
    </div>
    <p>This OTP is highly secure and is valid for exactly 10 minutes. </p>
    <p>If you did not initiate this request, please ignore this email.</p>
    <br>
    <p>Best regards,</p>
    <p>Mandell Admin System</p>
    """

    try:
        if (
            not settings.SMTP_USER
            or "your_email" in settings.SMTP_USER
            or not settings.SMTP_PASSWORD
        ):
            raise ValueError("SMTP credentials not configured")

        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))

        _send_smtp_message(msg)

        return f"Successfully sent OTP email to {email} via SMTP"
    except Exception as e:
        logger.error(f"SMTP failed to send OTP reset email to {email}: {str(e)}")
        try:
            with open("local_email_fallback.log", "a", encoding="utf-8") as f:
                f.write(f"--- OTP RESET [{email}] ---\n")
                f.write(f"OTP: {otp}\n")
                f.write("-" * 40 + "\n")
        except Exception:
            pass
        return f"Logged OTP email to {email} (SMTP fallback completed)"


def send_contact_email_sync(name: str, email: str, message: str) -> str:
    subject = f"Portfolio Contact Form: Message from {name}"
    body = f"""
    <h2>New Portfolio Contact Form Message</h2>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Message:</strong></p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;
    margin: 15px 0; color: #1f2937;">
        {message}
    </div>
    """

    try:
        if (
            not settings.SMTP_USER
            or "your_email" in settings.SMTP_USER
            or not settings.SMTP_PASSWORD
        ):
            raise ValueError("SMTP credentials not configured")

        recipient = settings.SMTP_TO_EMAIL or settings.SMTP_FROM_EMAIL

        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = recipient
        msg["Reply-To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))

        _send_smtp_message(msg)

        return f"Successfully sent contact email from {name} ({email}) via SMTP"  # noqa: E501
    except Exception as e:
        logger.error(
            f"SMTP failed to send contact email from {name} ({email}): {str(e)}"
        )
        try:
            with open("local_email_fallback.log", "a", encoding="utf-8") as f:
                f.write(f"--- CONTACT FORM [{name} ({email})] ---\n")
                f.write(f"MESSAGE: {message}\n")
                f.write("-" * 40 + "\n")
        except Exception:
            pass
        return f"Logged contact email from {name} ({email}) (SMTP fallback)"


class BackgroundTasksEmailService(IEmailService):
    def __init__(self, background_tasks: BackgroundTasks):
        self.background_tasks = background_tasks

    async def send_otp(self, email: str, otp: str) -> None:
        self.background_tasks.add_task(send_otp_email_sync, email, otp)

    async def send_contact_message(
        self,
        name: str,
        email: str,
        message: str,
    ) -> None:
        self.background_tasks.add_task(send_contact_email_sync, name, email, message)
