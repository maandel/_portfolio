import datetime
import random
import string
from typing import Dict, Any, Optional
import bcrypt
import jwt

from app.domain.entities import User
from app.domain.interfaces import IUserRepository, IOTPStore, IEmailService
from app.infrastructure.config.settings import settings

# --- Password Helpers ---
def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode("utf-8")
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

# --- JWT Helpers ---
def create_access_token(subject: str) -> str:
    expire = datetime.datetime.utcnow() + datetime.timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(subject: str) -> str:
    expire = datetime.datetime.utcnow() + datetime.timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


# --- Use Cases ---

class AuthUseCases:
    def __init__(self, user_repo: IUserRepository):
        self.user_repo = user_repo

    async def signup(self, email: str, password: str) -> User:
        existing = await self.user_repo.get_by_email(email)
        if existing:
            raise ValueError("User with this email already registered")

        hashed_pwd = hash_password(password)
        new_user = User(
            email=email,
            hashed_password=hashed_pwd,
            is_active=True,
            is_admin=True
        )
        return await self.user_repo.create(new_user)

    async def login(self, email: str, password: str) -> Dict[str, Any]:
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Incorrect email or password")
        if not user.is_active:
            raise ValueError("Inactive user account")

        access_token = create_access_token(user.email)
        refresh_token = create_refresh_token(user.email)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    async def forgot_password(
        self,
        email: str,
        otp_store: IOTPStore,
        email_service: IEmailService
    ) -> None:
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise ValueError("User with this email does not exist")

        # Generate 6-digit OTP
        otp = "".join(random.choices(string.digits, k=6))

        # Save in OTP cache store (valid for 10 minutes - 600s)
        await otp_store.set_otp(email, otp, ttl_seconds=600)

        # Dispatch async notification email
        await email_service.send_otp(email, otp)

    async def verify_otp(self, email: str, otp: str, otp_store: IOTPStore) -> None:
        stored_otp = await otp_store.get_otp(email)
        if not stored_otp:
            raise ValueError("OTP has expired or email is invalid")
        if stored_otp != otp:
            raise ValueError("Invalid 6-digit OTP")

        # Set verified flag (valid for 5 minutes - 300s)
        await otp_store.set_verified_flag(email, ttl_seconds=300)

    async def reset_password(
        self,
        email: str,
        otp: str,
        new_password: str,
        otp_store: IOTPStore
    ) -> None:
        # Check if email is verified
        verified = await otp_store.get_verified_flag(email)
        stored_otp = await otp_store.get_otp(email)

        if not verified and (not stored_otp or stored_otp != otp):
            raise ValueError("You must verify your OTP before resetting password or OTP is incorrect")

        user = await self.user_repo.get_by_email(email)
        if not user:
            raise ValueError("User not found")

        # Hash and save password
        hashed_pwd = hash_password(new_password)
        await self.user_repo.update_password(email, hashed_pwd)

        # Delete tags
        await otp_store.delete_otp(email)
        await otp_store.delete_verified_flag(email)
