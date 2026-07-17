from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.config.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.infrastructure.config.settings import settings
from app.interfaces.api.routers.auth import router as auth_router
from app.interfaces.api.routers.contact import router as contact_router
from app.interfaces.api.routers.portfolio import router as portfolio_router
from app.interfaces.api.routers.users import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Schema migrations are handled by Alembic in production.
    # Seeding removed.
    yield


app = FastAPI(
    title="Developer Portfolio CMS API",
    description="Secure REST API for portfolio content and "
    "admin CMS using clean architecture.",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

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


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = (
        "max-age=31536000; includeSubDomains"
    )
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
