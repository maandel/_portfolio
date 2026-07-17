import jwt
from fastapi import BackgroundTasks, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities import User
from app.domain.interfaces import (
    IEmailService,
    IOTPStore,
    IPortfolioRepository,
    IUserRepository,
)
from app.infrastructure.background_tasks.email_service import (
    BackgroundTasksEmailService,
)
from app.infrastructure.config.settings import settings
from app.infrastructure.db.repositories import (
    SqlAlchemyPortfolioRepository,
    SqlAlchemyUserRepository,
)
from app.infrastructure.db.session import get_db
from app.infrastructure.redis.otp_store import RedisOTPStore

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)


def get_user_repository(db: AsyncSession = Depends(get_db)) -> IUserRepository:
    return SqlAlchemyUserRepository(db)


def get_portfolio_repository(
    db: AsyncSession = Depends(get_db),
) -> IPortfolioRepository:
    return SqlAlchemyPortfolioRepository(db)


def get_otp_store() -> IOTPStore:
    return RedisOTPStore()


def get_email_service(
    background_tasks: BackgroundTasks,
) -> IEmailService:
    return BackgroundTasksEmailService(background_tasks)


async def get_current_user(
    request: Request,
    user_repo: IUserRepository = Depends(get_user_repository),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = request.cookies.get("admin_token")
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_email: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_email is None or token_type != "access":
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = await user_repo.get_by_email(user_email)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative privileges",
        )
    return current_user
