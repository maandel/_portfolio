import urllib.parse
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base

from app.infrastructure.config.settings import settings

DATABASE_URL = settings.get_database_url()
connect_args = {}

parsed = urllib.parse.urlparse(DATABASE_URL)
if parsed.query:
    queries = urllib.parse.parse_qs(parsed.query)
    if "sslmode" in queries or "ssl" in queries:
        clean_query = {
            k: v
            for k, v in queries.items()
            if k
            not in (
                "sslmode",
                "ssl",
            )
        }
        new_query_str = urllib.parse.urlencode(clean_query, doseq=True)
        DATABASE_URL = urllib.parse.urlunparse(
            (
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                new_query_str,
                parsed.fragment,
            )
        )
        import ssl

        sslmode = queries.get("sslmode", [""])[0].lower()
        ssl_param = queries.get("ssl", [""])[0].lower()

        if sslmode != "disable" and ssl_param not in ("disable", "false", "0"):
            ssl_context = ssl.create_default_context()
            if sslmode in ("no-verify", "prefer", "require") or ssl_param in (
                "no-verify",
                "prefer",
                "require",
            ):
                # sslmode=require is standard PG behavior to use SSL
                # but skip CA certificate verification
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_NONE
            elif sslmode == "verify-ca":
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_REQUIRED
            else:
                # Default to verify-full (strict check hostname and certificate)
                ssl_context.check_hostname = True
                ssl_context.verify_mode = ssl.CERT_REQUIRED
            connect_args["ssl"] = ssl_context

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_size=10,
    max_overflow=20,
    connect_args=connect_args,
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
