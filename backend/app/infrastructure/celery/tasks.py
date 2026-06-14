import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.infrastructure.celery.worker import celery_app
from app.infrastructure.config.settings import settings

logger = logging.getLogger(__name__)


@celery_app.task(name="app.infrastructure.celery.tasks.send_otp_email_task")
def send_otp_email_task(email: str, otp: str) -> str:
    subject = "Portfolio Admin - Password Reset OTP"
    body = f"""
    <h2>Password Reset Request</h2>
    <p>You have requested to reset your password. Use the secure 6-digit OTP below to proceed:</p>
    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937; border-radius: 8px; margin: 20px 0;">
        {otp}
    </div>
    <p>This OTP is highly secure and is valid for exactly 10 minutes. If you did not initiate this request, please ignore this email.</p>
    <br>
    <p>Best regards,</p>
    <p>Portfolio Admin System</p>
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

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        return f"Successfully sent OTP email to {email} via SMTP"
    except Exception as e:
        print("\n" + "=" * 50)
        print(f"SMTP EXCEPTION: {str(e)}")
        print("FALLBACK EMAIL LOG [OTP RESET]:")
        print(f"TO: {email}")
        print(f"OTP: {otp}")
        print("=" * 50 + "\n")
        return f"Logged OTP email to {email} (SMTP fallback completed)"


@celery_app.task(name="app.infrastructure.celery.tasks.send_contact_email_task")
def send_contact_email_task(name: str, email: str, message: str) -> str:
    subject = f"Portfolio Contact Form: Message from {name}"
    body = f"""
    <h2>New Portfolio Contact Form Message</h2>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Message:</strong></p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; color: #1f2937;">
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

        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = settings.SMTP_FROM_EMAIL
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        return f"Successfully sent contact email from {name} ({email}) via SMTP"
    except Exception as e:
        print("\n" + "=" * 50)
        print(f"SMTP EXCEPTION: {str(e)}")
        print("FALLBACK EMAIL LOG [CONTACT FORM]:")
        print(f"FROM: {name} ({email})")
        print(f"MESSAGE: {message}")
        print("=" * 50 + "\n")
        return f"Logged contact email from {name} ({email}) (SMTP fallback)"
