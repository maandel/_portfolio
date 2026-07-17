from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from app.infrastructure.config.limiter import limiter

from app.domain import schemas
from app.domain.interfaces import IEmailService, IOTPStore, IUserRepository
from app.interfaces.api.dependencies import (
    get_email_service,
    get_otp_store,
    get_user_repository,
)
from app.use_cases.auth_use_cases import AuthUseCases

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
@limiter.limit("10/minute")
async def login(
    request: Request,
    user_data: schemas.UserLogin,
    response: Response,
    user_repo: IUserRepository = Depends(get_user_repository),
):
    use_cases = AuthUseCases(user_repo)
    try:
        tokens = await use_cases.login(user_data.email, user_data.password)
        response.set_cookie(
            key="admin_token",
            value=tokens.access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=3600,
        )
        return {"message": "Login successful"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="admin_token",
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(
    request: schemas.ForgotPasswordRequest,
    user_repo: IUserRepository = Depends(get_user_repository),
    otp_store: IOTPStore = Depends(get_otp_store),
    email_service: IEmailService = Depends(get_email_service),
):
    use_cases = AuthUseCases(user_repo)
    try:
        await use_cases.forgot_password(
            request.email,
            otp_store,
            email_service,
        )
        return {
            "message": "A secure 6-digit OTP has been sent to your registered email"  # noqa: E501
        }
    except ValueError as e:
        # User lookup or email configuration failure
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-otp")
async def verify_otp(
    request: schemas.VerifyOTPRequest,
    otp_store: IOTPStore = Depends(get_otp_store),
):
    use_cases = AuthUseCases(None)
    try:
        await use_cases.verify_otp(request.email, request.otp, otp_store)
        return {"message": "OTP verified successfully. You may now reset your password"}  # noqa: E501
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset-password")
async def reset_password(
    request: schemas.ResetPasswordRequest,
    user_repo: IUserRepository = Depends(get_user_repository),
    otp_store: IOTPStore = Depends(get_otp_store),
):
    use_cases = AuthUseCases(user_repo)
    try:
        await use_cases.reset_password(
            request.email, request.otp, request.new_password, otp_store
        )
        return {"message": "Password has been successfully updated"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
