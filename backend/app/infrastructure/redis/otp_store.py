import logging
from typing import Optional

import redis.asyncio as aioredis
from app.domain.interfaces import IOTPStore
from app.infrastructure.config.settings import settings

logger = logging.getLogger(__name__)

redis_client = aioredis.Redis(
    host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0, decode_responses=True
)


class RedisOTPStore(IOTPStore):
    def __init__(self):
        self.client = redis_client

    async def set_otp(self, email: str, otp: str, ttl_seconds: int) -> None:
        await self.client.setex(f"otp:{email}", ttl_seconds, otp)

    async def get_otp(self, email: str) -> Optional[str]:
        return await self.client.get(f"otp:{email}")

    async def delete_otp(self, email: str) -> None:
        await self.client.delete(f"otp:{email}")

    async def set_verified_flag(self, email: str, ttl_seconds: int) -> None:
        await self.client.setex(f"otp_verified:{email}", ttl_seconds, "true")

    async def get_verified_flag(self, email: str) -> bool:
        val = await self.client.get(f"otp_verified:{email}")
        return val == "true"

    async def delete_verified_flag(self, email: str) -> None:
        await self.client.delete(f"otp_verified:{email}")
