from typing import AsyncGenerator

from app.infrastructure.config.settings import settings
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

DATABASE_URL = settings.get_database_url()

engine = create_async_engine(
    DATABASE_URL, echo=False, future=True, pool_size=10, max_overflow=20
)

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
