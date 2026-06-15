from typing import List, Optional
from app.domain.entities import Bio, Experience, Project, Technology
from app.domain.interfaces import IPortfolioRepository


class PortfolioUseCases:
    def __init__(self, portfolio_repo: IPortfolioRepository):
        self.repo = portfolio_repo

    # --- BIO CRUD ---
    async def get_profile(self) -> Optional[Bio]:
        return await self.repo.get_bio()

    async def update_profile(
        self,
        name: str,
        title: str,
        about_me: str,
        email: str,
        resume_url: Optional[str] = None,
        github_url: Optional[str] = None,
        linkedin_url: Optional[str] = None,
        twitter_url: Optional[str] = None,
        avatar_url: Optional[str] = None,
    ) -> Bio:
        bio = Bio(
            name=name,
            title=title,
            about_me=about_me,
            email=email,
            resume_url=resume_url,
            github_url=github_url,
            linkedin_url=linkedin_url,
            twitter_url=twitter_url,
            avatar_url=avatar_url,
        )
        return await self.repo.update_or_create_bio(bio)

    # --- EXPERIENCE CRUD ---
    async def get_experiences(self) -> List[Experience]:
        return await self.repo.get_experiences()

    async def create_experience(
        self,
        company: str,
        role: str,
        start_date: str,
        description: str,
        end_date: Optional[str] = None,
        order_index: int = 0,
    ) -> Experience:
        exp = Experience(
            company=company,
            role=role,
            start_date=start_date,
            description=description,
            end_date=end_date,
            order_index=order_index,
        )
        return await self.repo.create_experience(exp)

    async def update_experience(
        self,
        exp_id: int,
        company: Optional[str] = None,
        role: Optional[str] = None,
        start_date: Optional[str] = None,
        description: Optional[str] = None,
        end_date: Optional[str] = None,
        end_date_set: bool = False,
        order_index: Optional[int] = None,
    ) -> Experience:
        existing = await self.repo.get_experience_by_id(exp_id)
        if not existing:
            raise ValueError(f"Experience with ID {exp_id} not found")

        updated_exp = Experience(
            company=company if company is not None else existing.company,
            role=role if role is not None else existing.role,
            start_date=start_date if start_date is not None else existing.start_date,
            description=description if description is not None else existing.description,
            # Allow explicit None to clear end_date
            end_date=end_date if end_date_set else existing.end_date,
            order_index=order_index if order_index is not None else existing.order_index,
            id=exp_id,
        )
        result = await self.repo.update_experience(exp_id, updated_exp)
        if not result:
            raise ValueError("Update operation failed")
        return result

    async def delete_experience(self, exp_id: int) -> bool:
        success = await self.repo.delete_experience(exp_id)
        if not success:
            raise ValueError(f"Experience with ID {exp_id} not found")
        return True

    # --- PROJECT CRUD ---
    async def get_projects(self) -> List[Project]:
        return await self.repo.get_projects()

    async def create_project(
        self,
        title: str,
        description: str,
        tech_tags: List[str],
        repo_link: Optional[str] = None,
        live_link: Optional[str] = None,
        order_index: int = 0,
    ) -> Project:
        proj = Project(
            title=title,
            description=description,
            tech_tags=tech_tags,
            repo_link=repo_link,
            live_link=live_link,
            order_index=order_index,
        )
        return await self.repo.create_project(proj)

    async def update_project(
        self,
        project_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        tech_tags: Optional[List[str]] = None,
        repo_link: Optional[str] = None,
        repo_link_set: bool = False,
        live_link: Optional[str] = None,
        live_link_set: bool = False,
        order_index: Optional[int] = None,
    ) -> Project:
        existing = await self.repo.get_project_by_id(project_id)
        if not existing:
            raise ValueError(f"Project with ID {project_id} not found")

        updated_proj = Project(
            title=title if title is not None else existing.title,
            description=description if description is not None else existing.description,
            tech_tags=tech_tags if tech_tags is not None else existing.tech_tags,
            # Allow explicit None (field present in request) to clear the link
            repo_link=repo_link if repo_link_set else existing.repo_link,
            live_link=live_link if live_link_set else existing.live_link,
            order_index=order_index if order_index is not None else existing.order_index,
            id=project_id,
        )
        result = await self.repo.update_project(project_id, updated_proj)
        if not result:
            raise ValueError("Update operation failed")
        return result

    async def delete_project(self, project_id: int) -> bool:
        success = await self.repo.delete_project(project_id)
        if not success:
            raise ValueError(f"Project with ID {project_id} not found")
        return True

    # --- TECHNOLOGY CRUD ---
    async def get_technologies(self) -> List[Technology]:
        return await self.repo.get_technologies()

    async def create_technology(
        self,
        name: str,
        category: str,
        proficiency: Optional[int] = None,
        icon_name: Optional[str] = None,
        order_index: int = 0,
    ) -> Technology:
        tech = Technology(
            name=name,
            category=category,
            proficiency=proficiency,
            icon_name=icon_name,
            order_index=order_index,
        )
        return await self.repo.create_technology(tech)

    async def update_technology(
        self,
        tech_id: int,
        name: Optional[str] = None,
        category: Optional[str] = None,
        proficiency: Optional[int] = None,
        proficiency_set: bool = False,
        icon_name: Optional[str] = None,
        icon_name_set: bool = False,
        order_index: Optional[int] = None,
    ) -> Technology:
        existing = await self.repo.get_technology_by_id(tech_id)
        if not existing:
            raise ValueError(f"Technology with ID {tech_id} not found")

        updated_tech = Technology(
            name=name if name is not None else existing.name,
            category=category if category is not None else existing.category,
            # Allow explicit None to clear proficiency / icon_name
            proficiency=proficiency if proficiency_set else existing.proficiency,
            icon_name=icon_name if icon_name_set else existing.icon_name,
            order_index=order_index if order_index is not None else existing.order_index,
            id=tech_id,
        )
        result = await self.repo.update_technology(tech_id, updated_tech)
        if not result:
            raise ValueError("Update operation failed")
        return result

    async def delete_technology(self, tech_id: int) -> bool:
        success = await self.repo.delete_technology(tech_id)
        if not success:
            raise ValueError(f"Technology with ID {tech_id} not found")
        return True
