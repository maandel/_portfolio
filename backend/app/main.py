from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.config.settings import settings
from app.infrastructure.db.session import Base, engine
from app.interfaces.api.routers.auth import router as auth_router
from app.interfaces.api.routers.contact import router as contact_router
from app.interfaces.api.routers.portfolio import router as portfolio_router
from app.interfaces.api.routers.users import router as users_router
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await seed_database()
    yield


app = FastAPI(
    title="Developer Portfolio CMS API",
    description="Secure REST API for portfolio content and "
    "admin CMS using clean architecture.",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(portfolio_router, prefix="/api/v1")
app.include_router(contact_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")

from fastapi import Request

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
    return response


@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Developer Portfolio CMS API is operational. "
        "Visit /docs for documentation.",
    }
