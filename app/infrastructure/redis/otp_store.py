import logging
import redis
from typing import Optional
from app.domain.interfaces import IOTPStore
from app.infrastructure.config.settings import settings

logger = logging.getLogger(__name__)

class RedisOTPStore(IOTPStore):
    def __init__(self):
        try:
            self.client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=0,
                decode_responses=True
            )
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.client = None

    async def set_otp(self, email: str, otp: str, ttl_seconds: int) -> None:
        if not self.client:
            raise RuntimeError("Redis client is not initialized")
        self.client.setex(f"otp:{email}", ttl_seconds, otp)

    async def get_otp(self, email: str) -> Optional[str]:
        if not self.client:
            raise RuntimeError("Redis client is not initialized")
        return self.client.get(f"otp:{email}")

    async def delete_otp(self, email: str) -> None:
        if not self.client:
            return
        self.client.delete(f"otp:{email}")

    async def set_verified_flag(self, email: str, ttl_seconds: int) -> None:
        if not self.client:
            raise RuntimeError("Redis client is not initialized")
        self.client.setex(f"otp_verified:{email}", ttl_seconds, "true")

    async def get_verified_flag(self, email: str) -> bool:
        if not self.client:
            return False
        return self.client.get(f"otp_verified:{email}") == "true"

    async def delete_verified_flag(self, email: str) -> None:
        if not self.client:
            return
        self.client.delete(f"otp_verified:{email}")
