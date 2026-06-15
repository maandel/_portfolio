import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

import httpx
from fastapi import BackgroundTasks

from app.domain.interfaces import IEmailService
from app.infrastructure.config.settings import settings

logger = logging.getLogger(__name__)


def _send_brevo_message(
    sender_name: str,
    to_email: str,
    subject: str,
    html_body: str,
    reply_to_email: Optional[str] = None,
) -> None:
    if not settings.BREVO_API_KEY:
        raise ValueError("Brevo API key is not configured")

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json",
    }
    payload = {
        "sender": {"name": sender_name, "email": settings.SMTP_FROM_EMAIL},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_body,
    }
    if reply_to_email:
        payload["replyTo"] = {"email": reply_to_email, "name": sender_name}

    response = httpx.post(
        url,
        json=payload,
        headers=headers,
        timeout=settings.SMTP_TIMEOUT_SECONDS,
    )
    if response.status_code >= 400:
        raise Exception(
            f"Brevo API error {response.status_code}: {response.text}"
        )


def _send_smtp_message(msg: MIMEMultipart) -> None:
    if not settings.use_ssl and not settings.SMTP_USE_STARTTLS:
        raise ValueError(
            "Insecure SMTP authentication: TLS/SSL is required but both SSL "
            "and STARTTLS are disabled."
        )

    if settings.use_ssl:
        with smtplib.SMTP_SSL(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            timeout=settings.SMTP_TIMEOUT_SECONDS,
        ) as server:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    else:
        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            timeout=settings.SMTP_TIMEOUT_SECONDS,
        ) as server:
            if settings.SMTP_USE_STARTTLS:
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
        if settings.BREVO_API_KEY:
            _send_brevo_message("Mandell Admin", email, subject, body)
            return f"Successfully sent OTP email to {email} via Brevo HTTP API"

        # Fallback to SMTP
        if (
            not settings.SMTP_USER
            or "your_email" in settings.SMTP_USER
            or not settings.SMTP_PASSWORD
        ):
            raise ValueError("SMTP credentials and Brevo API Key not configured")

        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))

        _send_smtp_message(msg)

        return f"Successfully sent OTP email to {email} via SMTP"
    except Exception as e:
        logger.error(f"Email delivery failed to send OTP reset email to {email}: {str(e)}")
        if settings.EMAIL_FALLBACK_TO_FILE:
            wrote_fallback = False
            try:
                with open("local_email_fallback.log", "a", encoding="utf-8") as f:
                    f.write(f"--- OTP RESET [{email}] ---\n")
                    f.write(f"OTP: {otp}\n")
                    f.write("-" * 40 + "\n")
                wrote_fallback = True
            except Exception as io_err:
                logger.exception(
                    f"Failed to write OTP fallback to file for {email}: {str(io_err)}"
                )
            if wrote_fallback:
                return f"Logged OTP email to {email} (fallback completed)"
            return f"Failed to send OTP email to {email} (fallback write failed)"
        return f"Failed to send OTP email to {email} (no fallback)"


def send_contact_email_sync(name: str, email: str, message: str) -> str:
    subject = f"Mandell Contact Form: Message from {name}"
    body = f"""
    <h2>New Mandell Contact Form Message</h2>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Message:</strong></p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;
    margin: 15px 0; color: #1f2937;">
        {message}
    </div>
    """

    try:
        recipient = settings.SMTP_TO_EMAIL or settings.SMTP_FROM_EMAIL

        if settings.BREVO_API_KEY:
            _send_brevo_message(name, recipient, subject, body, reply_to_email=email)
            return f"Successfully sent contact email from {name} ({email}) via Brevo HTTP API"

        # Fallback to SMTP
        if (
            not settings.SMTP_USER
            or "your_email" in settings.SMTP_USER
            or not settings.SMTP_PASSWORD
        ):
            raise ValueError("SMTP credentials and Brevo API Key not configured")

        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = recipient
        msg["Reply-To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))

        _send_smtp_message(msg)

        return f"Successfully sent contact email from {name} ({email}) via SMTP"
    except Exception as e:
        logger.error(
            f"Email delivery failed to send contact email from {name} ({email}): {str(e)}"
        )
        if settings.EMAIL_FALLBACK_TO_FILE:
            wrote_fallback = False
            try:
                with open("local_email_fallback.log", "a", encoding="utf-8") as f:
                    f.write(f"--- CONTACT FORM [{name} ({email})] ---\n")
                    f.write(f"MESSAGE: {message}\n")
                    f.write("-" * 40 + "\n")
                wrote_fallback = True
            except Exception as io_err:
                logger.exception(
                    "Failed to write contact message fallback to file "
                    f"for {name} ({email}): {str(io_err)}"
                )
            if wrote_fallback:
                return f"Logged contact email from {name} ({email}) (fallback completed)"
            return (
                f"Failed to send contact email from {name} ({email}) "
                "(fallback write failed)"
            )
        return f"Failed to send contact email from {name} ({email})"


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
