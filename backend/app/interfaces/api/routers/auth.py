from fastapi import APIRouter, Depends, HTTPException, status
from app.domain import schemas
from app.domain.interfaces import IUserRepository, IOTPStore, IEmailService
from app.interfaces.api.dependencies import get_user_repository, get_otp_store, get_email_service
from app.use_cases.auth_use_cases import AuthUseCases

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post(
    "/signup",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED
)
async def signup(
    user_data: schemas.UserCreate,
    user_repo: IUserRepository = Depends(get_user_repository)
):
    use_cases = AuthUseCases(user_repo)
    try:
        user = await use_cases.signup(user_data.email, user_data.password)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=schemas.Token)
async def login(
    user_data: schemas.UserLogin,
    user_repo: IUserRepository = Depends(get_user_repository)
):
    use_cases = AuthUseCases(user_repo)
    try:
        tokens = await use_cases.login(user_data.email, user_data.password)
        return tokens
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/forgot-password")
async def forgot_password(
    request: schemas.ForgotPasswordRequest,
    user_repo: IUserRepository = Depends(get_user_repository),
    otp_store: IOTPStore = Depends(get_otp_store),
    email_service: IEmailService = Depends(get_email_service)
):
    use_cases = AuthUseCases(user_repo)
    try:
        await use_cases.forgot_password(request.email, otp_store, email_service)
        return {"message": "A secure 6-digit OTP has been sent to your registered email"}
    except ValueError as e:
        # User lookup or email configuration failure
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-otp")
async def verify_otp(
    request: schemas.VerifyOTPRequest,
    otp_store: IOTPStore = Depends(get_otp_store)
):
    # Dummy user repo dependency injection (not needed for OTP verification but aligns constructor)
    use_cases = AuthUseCases(None)
    try:
        await use_cases.verify_otp(request.email, request.otp, otp_store)
        return {"message": "OTP verified successfully. You may now reset your password"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset-password")
async def reset_password(
    request: schemas.ResetPasswordRequest,
    user_repo: IUserRepository = Depends(get_user_repository),
    otp_store: IOTPStore = Depends(get_otp_store)
):
    use_cases = AuthUseCases(user_repo)
    try:
        await use_cases.reset_password(request.email, request.otp, request.new_password, otp_store)
        return {"message": "Password has been successfully updated"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
