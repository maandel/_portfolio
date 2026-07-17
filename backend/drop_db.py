import asyncio
from app.infrastructure.db.session import engine, Base


async def drop():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


if __name__ == "__main__":
    asyncio.run(drop())
