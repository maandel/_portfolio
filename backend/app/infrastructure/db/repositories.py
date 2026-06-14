from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.domain.entities import Bio, Experience, Project, Technology, User
from app.domain.interfaces import IPortfolioRepository, IUserRepository
from app.infrastructure.db.models import (
    BioDb,
    ExperienceDb,
    ProjectDb,
    TechnologyDb,
    UserDb,
)


# --- Mappers ---
def to_user_entity(db_user: UserDb) -> User:
    return User(
        email=db_user.email,
        hashed_password=db_user.hashed_password,
        is_active=db_user.is_active,
        is_admin=db_user.is_admin,
        id=db_user.id,
    )


def to_bio_entity(db_bio: BioDb) -> Bio:
    return Bio(
        name=db_bio.name,
        title=db_bio.title,
        about_me=db_bio.about_me,
        email=db_bio.email,
        resume_url=db_bio.resume_url,
        github_url=db_bio.github_url,
        linkedin_url=db_bio.linkedin_url,
        twitter_url=db_bio.twitter_url,
        avatar_url=db_bio.avatar_url,
        id=db_bio.id,
    )


def to_experience_entity(db_exp: ExperienceDb) -> Experience:
    return Experience(
        company=db_exp.company,
        role=db_exp.role,
        start_date=db_exp.start_date,
        end_date=db_exp.end_date,
        description=db_exp.description,
        order_index=db_exp.order_index,
        id=db_exp.id,
    )


def to_project_entity(db_proj: ProjectDb) -> Project:
    return Project(
        title=db_proj.title,
        description=db_proj.description,
        tech_tags=db_proj.tech_tags or [],
        repo_link=db_proj.repo_link,
        live_link=db_proj.live_link,
        order_index=db_proj.order_index,
        id=db_proj.id,
    )


def to_tech_entity(db_tech: TechnologyDb) -> Technology:
    return Technology(
        name=db_tech.name,
        category=db_tech.category,
        proficiency=db_tech.proficiency,
        icon_name=db_tech.icon_name,
        order_index=db_tech.order_index,
        id=db_tech.id,
    )


# --- Repositories ---


class SqlAlchemyUserRepository(IUserRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(UserDb).where(UserDb.email == email))
        db_user = result.scalars().first()
        return to_user_entity(db_user) if db_user else None

    async def create(self, user: User) -> User:
        db_user = UserDb(
            email=user.email,
            hashed_password=user.hashed_password,
            is_active=user.is_active,
            is_admin=user.is_admin,
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return to_user_entity(db_user)

    async def update_password(self, email: str, hashed_password: str) -> User:
        result = await self.db.execute(select(UserDb).where(UserDb.email == email))
        db_user = result.scalars().first()
        if not db_user:
            raise ValueError(f"User with email {email} not found")
        db_user.hashed_password = hashed_password
        await self.db.commit()
        await self.db.refresh(db_user)
        return to_user_entity(db_user)

    async def list_users(self) -> List[User]:
        result = await self.db.execute(select(UserDb).order_by(UserDb.id.asc()))
        db_users = result.scalars().all()
        return [to_user_entity(u) for u in db_users]

    async def update_status(self, user_id: int, is_active: bool) -> Optional[User]:
        result = await self.db.execute(select(UserDb).where(UserDb.id == user_id))
        db_user = result.scalars().first()
        if not db_user:
            return None
        db_user.is_active = is_active
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return to_user_entity(db_user)

    async def update_user(
        self,
        user_id: int,
        email: Optional[str] = None,
        hashed_password: Optional[str] = None,
        is_admin: Optional[bool] = None,
    ) -> Optional[User]:
        result = await self.db.execute(select(UserDb).where(UserDb.id == user_id))
        db_user = result.scalars().first()
        if not db_user:
            return None
        if email is not None:
            db_user.email = email
        if hashed_password is not None:
            db_user.hashed_password = hashed_password
        if is_admin is not None:
            db_user.is_admin = is_admin
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return to_user_entity(db_user)

    async def delete_user(self, user_id: int) -> bool:
        result = await self.db.execute(select(UserDb).where(UserDb.id == user_id))
        db_user = result.scalars().first()
        if not db_user:
            return False
        await self.db.delete(db_user)
        await self.db.commit()
        return True


class SqlAlchemyPortfolioRepository(IPortfolioRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_bio(self) -> Optional[Bio]:
        result = await self.db.execute(select(BioDb).order_by(BioDb.id.asc()))
        db_bio = result.scalars().first()
        return to_bio_entity(db_bio) if db_bio else None

    async def update_or_create_bio(self, bio: Bio) -> Bio:
        result = await self.db.execute(select(BioDb).order_by(BioDb.id.asc()))
        existing_bio = result.scalars().first()
        if existing_bio:
            existing_bio.name = bio.name
            existing_bio.title = bio.title
            existing_bio.about_me = bio.about_me
            existing_bio.email = bio.email
            existing_bio.resume_url = bio.resume_url
            existing_bio.github_url = bio.github_url
            existing_bio.linkedin_url = bio.linkedin_url
            existing_bio.twitter_url = bio.twitter_url
            existing_bio.avatar_url = bio.avatar_url
            db_bio = existing_bio
        else:
            db_bio = BioDb(
                name=bio.name,
                title=bio.title,
                about_me=bio.about_me,
                email=bio.email,
                resume_url=bio.resume_url,
                github_url=bio.github_url,
                linkedin_url=bio.linkedin_url,
                twitter_url=bio.twitter_url,
                avatar_url=bio.avatar_url,
            )
            self.db.add(db_bio)

        await self.db.commit()
        await self.db.refresh(db_bio)
        return to_bio_entity(db_bio)

    async def get_experiences(self) -> List[Experience]:
        result = await self.db.execute(
            select(ExperienceDb).order_by(
                ExperienceDb.order_index.asc(), ExperienceDb.id.desc()
            )
        )
        return [to_experience_entity(x) for x in result.scalars().all()]

    async def get_experience_by_id(self, exp_id: int) -> Optional[Experience]:
        result = await self.db.execute(
            select(ExperienceDb).where(ExperienceDb.id == exp_id)
        )
        db_exp = result.scalars().first()
        return to_experience_entity(db_exp) if db_exp else None

    async def create_experience(self, exp: Experience) -> Experience:
        db_exp = ExperienceDb(
            company=exp.company,
            role=exp.role,
            start_date=exp.start_date,
            end_date=exp.end_date,
            description=exp.description,
            order_index=exp.order_index,
        )
        self.db.add(db_exp)
        await self.db.commit()
        await self.db.refresh(db_exp)
        return to_experience_entity(db_exp)

    async def update_experience(
        self, exp_id: int, exp: Experience
    ) -> Optional[Experience]:
        result = await self.db.execute(
            select(ExperienceDb).where(ExperienceDb.id == exp_id)
        )
        db_exp = result.scalars().first()
        if not db_exp:
            return None
        db_exp.company = exp.company
        db_exp.role = exp.role
        db_exp.start_date = exp.start_date
        db_exp.end_date = exp.end_date
        db_exp.description = exp.description
        db_exp.order_index = exp.order_index
        self.db.add(db_exp)
        await self.db.commit()
        await self.db.refresh(db_exp)
        return to_experience_entity(db_exp)

    async def delete_experience(self, exp_id: int) -> bool:
        result = await self.db.execute(
            select(ExperienceDb).where(ExperienceDb.id == exp_id)
        )
        db_exp = result.scalars().first()
        if not db_exp:
            return False
        await self.db.delete(db_exp)
        await self.db.commit()
        return True

    async def get_projects(self) -> List[Project]:
        result = await self.db.execute(
            select(ProjectDb).order_by(ProjectDb.order_index.asc(), ProjectDb.id.desc())
        )
        return [to_project_entity(p) for p in result.scalars().all()]

    async def get_project_by_id(self, project_id: int) -> Optional[Project]:
        result = await self.db.execute(
            select(ProjectDb).where(ProjectDb.id == project_id)
        )
        db_proj = result.scalars().first()
        return to_project_entity(db_proj) if db_proj else None

    async def create_project(self, project: Project) -> Project:
        db_proj = ProjectDb(
            title=project.title,
            description=project.description,
            tech_tags=project.tech_tags,
            repo_link=project.repo_link,
            live_link=project.live_link,
            order_index=project.order_index,
        )
        self.db.add(db_proj)
        await self.db.commit()
        await self.db.refresh(db_proj)
        return to_project_entity(db_proj)

    async def update_project(
        self, project_id: int, project: Project
    ) -> Optional[Project]:
        result = await self.db.execute(
            select(ProjectDb).where(ProjectDb.id == project_id)
        )
        db_proj = result.scalars().first()
        if not db_proj:
            return None
        db_proj.title = project.title
        db_proj.description = project.description
        db_proj.tech_tags = project.tech_tags
        db_proj.repo_link = project.repo_link
        db_proj.live_link = project.live_link
        db_proj.order_index = project.order_index
        self.db.add(db_proj)
        await self.db.commit()
        await self.db.refresh(db_proj)
        return to_project_entity(db_proj)

    async def delete_project(self, project_id: int) -> bool:
        result = await self.db.execute(
            select(ProjectDb).where(ProjectDb.id == project_id)
        )
        db_proj = result.scalars().first()
        if not db_proj:
            return False
        await self.db.delete(db_proj)
        await self.db.commit()
        return True

    async def get_technologies(self) -> List[Technology]:
        result = await self.db.execute(
            select(TechnologyDb).order_by(
                TechnologyDb.order_index.asc(), TechnologyDb.id.desc()
            )
        )
        return [to_tech_entity(t) for t in result.scalars().all()]

    async def get_technology_by_id(self, tech_id: int) -> Optional[Technology]:
        result = await self.db.execute(
            select(TechnologyDb).where(TechnologyDb.id == tech_id)
        )
        db_tech = result.scalars().first()
        return to_tech_entity(db_tech) if db_tech else None

    async def create_technology(self, tech: Technology) -> Technology:
        result = await self.db.execute(
            select(TechnologyDb).where(TechnologyDb.name == tech.name)
        )
        existing = result.scalars().first()
        if existing:
            existing.category = tech.category
            existing.proficiency = tech.proficiency
            existing.icon_name = tech.icon_name
            existing.order_index = tech.order_index
            db_tech = existing
        else:
            db_tech = TechnologyDb(
                name=tech.name,
                category=tech.category,
                proficiency=tech.proficiency,
                icon_name=tech.icon_name,
                order_index=tech.order_index,
            )
            self.db.add(db_tech)

        await self.db.commit()
        await self.db.refresh(db_tech)
        return to_tech_entity(db_tech)

    async def update_technology(
        self, tech_id: int, tech: Technology
    ) -> Optional[Technology]:
        result = await self.db.execute(
            select(TechnologyDb).where(TechnologyDb.id == tech_id)
        )
        db_tech = result.scalars().first()
        if not db_tech:
            return None
        db_tech.name = tech.name
        db_tech.category = tech.category
        db_tech.proficiency = tech.proficiency
        db_tech.icon_name = tech.icon_name
        db_tech.order_index = tech.order_index
        self.db.add(db_tech)
        await self.db.commit()
        await self.db.refresh(db_tech)
        return to_tech_entity(db_tech)

    async def delete_technology(self, tech_id: int) -> bool:
        result = await self.db.execute(
            select(TechnologyDb).where(TechnologyDb.id == tech_id)
        )
        db_tech = result.scalars().first()
        if not db_tech:
            return False
        await self.db.delete(db_tech)
        await self.db.commit()
        return True
