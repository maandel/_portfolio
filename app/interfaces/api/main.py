from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.db.session import engine, Base
from app.interfaces.api.routers.auth import router as auth_router
from app.interfaces.api.routers.portfolio import router as portfolio_router
from app.interfaces.api.routers.contact import router as contact_router
from app.seed import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables (Alembic can also manage this, but this guarantees tables exist on run)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Run the database seeder to import initial assets
    await seed_database()
    yield

app = FastAPI(
    title="Developer Portfolio CMS API",
    description="Secure REST API for portfolio content and admin CMS using clean architecture.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes with /api/v1 prefix
app.include_router(auth_router, prefix="/api/v1")
app.include_router(portfolio_router, prefix="/api/v1")
app.include_router(contact_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Developer Portfolio CMS API is operational. Visit /docs for documentation."
    }
