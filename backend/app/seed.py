import logging
import secrets

from sqlalchemy.future import select

from app.infrastructure.config.settings import settings
from app.infrastructure.db.models import (
    BioDb,
    ExperienceDb,
    ProjectDb,
    TechnologyDb,
    UserDb,
)
from app.infrastructure.db.session import async_session_maker
from app.use_cases.auth_use_cases import hash_password

logger = logging.getLogger(__name__)


async def seed_database():
    async with async_session_maker() as session:
        try:
            admin_email = settings.ADMIN_EMAIL
            result = await session.execute(
                select(UserDb).where(UserDb.email == admin_email)
            )
            existing_admin = result.scalars().first()

            if existing_admin:
                logger.info("Database is already seeded.")
                return

            logger.info("Seeding database with default data...")

            admin_password = settings.ADMIN_PASSWORD
            if not admin_password:
                admin_password = secrets.token_urlsafe(16)
                logger.warning("=" * 60)
                logger.warning(
                    "ADMIN PASSWORD NOT SPECIFIED. GENERATING SECURE RANDOM PASSWORD:"  # noqa: E501
                )
                logger.warning(f"  EMAIL:    {admin_email}")
                logger.warning(f"  PASSWORD: {admin_password}")
                logger.warning(
                    "Please copy these credentials. They will not be displayed again."  # noqa: E501
                )
                logger.warning("=" * 60)

            admin_user = UserDb(
                email=admin_email,
                hashed_password=hash_password(admin_password),
                is_active=True,
                is_admin=True,
            )
            session.add(admin_user)

            default_bio = BioDb(
                name="Developer Mandell",
                title="Senior Backend Engineer & Systems Architect",
                about_me="Dedicated to crafting robust API designs, "
                "high-throughput systems, and clean architectural patterns. "
                "Deeply specialized in Python, asyncio, relational databases, "
                "caching, and task queues.",
                email=admin_email,
                resume_url="#",
                github_url="https://github.com",
                linkedin_url="https://linkedin.com",
                twitter_url="https://twitter.com",
                avatar_url="https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=300&h=300&fit=crop",  # noqa: E501
            )
            session.add(default_bio)

            kodehauz_exp = ExperienceDb(
                company="Kodehauz",
                role="Software Engineering Intern",
                start_date="Jan 2026",
                end_date="Present",
                description="Engineered backend application APIs using "
                "FastAPI, PostgreSQL, and Celery worker routines. "
                "Standardized domain entities and implemented dependency "
                "inversion to transition legacy systems to strict Clean "
                "Architecture. Enhanced system security with secure JWT "
                "flows and managed multi-container scaling via Docker "
                "Compose.",
                order_index=0,
            )
            session.add(kodehauz_exp)

            wordwiz_proj = ProjectDb(
                title="be-wordwiz",
                description="An advanced dictionary parsing and word "
                "game analytics backend. Features scalable REST APIs, "
                "dynamic indexing, dictionary caching via Redis, and "
                "high-performance asynchronous background parsing jobs "
                "executed by Celery workers.",
                tech_tags=[
                    "Python",
                    "FastAPI",
                    "PostgreSQL",
                    "Redis",
                    "Celery",
                    "Docker",
                ],
                repo_link="https://github.com/mandell-tech/be-wordwiz",
                live_link="https://wordwiz.mandell.tech",
                order_index=0,
            )
            session.add(wordwiz_proj)

            techs = [
                TechnologyDb(
                    name="Python",
                    category="Backend",
                    proficiency=95,
                    icon_name="python",
                    order_index=0,
                ),
                TechnologyDb(
                    name="FastAPI",
                    category="Backend",
                    proficiency=90,
                    icon_name="fastapi",
                    order_index=1,
                ),
                TechnologyDb(
                    name="PostgreSQL",
                    category="Database",
                    proficiency=85,
                    icon_name="postgresql",
                    order_index=2,
                ),
                TechnologyDb(
                    name="Redis",
                    category="Database",
                    proficiency=80,
                    icon_name="redis",
                    order_index=3,
                ),
                TechnologyDb(
                    name="Docker",
                    category="DevOps",
                    proficiency=85,
                    icon_name="docker",
                    order_index=4,
                ),
                TechnologyDb(
                    name="React / Next.js",
                    category="Frontend",
                    proficiency=70,
                    icon_name="react",
                    order_index=5,
                ),
            ]
            for t in techs:
                session.add(t)

            await session.commit()
            logger.info("Database seeding completed successfully!")
        except Exception as e:
            await session.rollback()
            logger.error(f"Error seeding database: {e}")
            raise
