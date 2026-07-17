from fastapi import APIRouter, Depends, status, Request
from app.infrastructure.config.limiter import limiter

from app.domain import schemas
from app.domain.interfaces import IEmailService
from app.interfaces.api.dependencies import get_email_service

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("/", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("5/minute")
async def submit_contact_form(
    request: Request,
    message_data: schemas.ContactMessage,
    email_service: IEmailService = Depends(get_email_service),
):
    await email_service.send_contact_message(
        name=message_data.name,
        email=message_data.email,
        message=message_data.message,
    )
    return {
        "message": "Your message has been received and is being processed in the background"  # noqa: E501
    }
