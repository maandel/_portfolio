from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.domain import schemas
from app.domain.entities import User
from app.domain.interfaces import IPortfolioRepository
from app.interfaces.api.dependencies import get_portfolio_repository, get_current_admin
from app.use_cases.portfolio_use_cases import PortfolioUseCases

router = APIRouter(tags=["portfolio"])

# --- BIO ENDPOINTS ---

@router.get("/profile", response_model=schemas.BioResponse)
async def get_profile(portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository)):
    use_cases = PortfolioUseCases(portfolio_repo)
    bio = await use_cases.get_profile()
    if not bio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile/Bio content not found"
        )
    return bio


@router.put("/profile", response_model=schemas.BioResponse)
async def update_profile(
    bio_data: schemas.BioCreate,
    portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository),
    admin: User = Depends(get_current_admin)
):
    use_cases = PortfolioUseCases(portfolio_repo)
    return await use_cases.update_profile(
        name=bio_data.name,
        title=bio_data.title,
        about_me=bio_data.about_me,
        email=bio_data.email,
        resume_url=bio_data.resume_url,
        github_url=bio_data.github_url,
        linkedin_url=bio_data.linkedin_url,
        twitter_url=bio_data.twitter_url,
        avatar_url=bio_data.avatar_url
    )


# --- EXPERIENCE ENDPOINTS ---

@router.get("/experiences", response_model=List[schemas.ExperienceResponse])
async def get_experiences_list(portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository)):
    use_cases = PortfolioUseCases(portfolio_repo)
    return await use_cases.get_experiences()


@router.post(
    "/experiences",
    response_model=schemas.ExperienceResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_new_experience(
    exp_data: schemas.ExperienceCreate,
    portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository),
    admin: User = Depends(get_current_admin)
):
    use_cases = PortfolioUseCases(portfolio_repo)
    return await use_cases.create_experience(
        company=exp_data.company,
        role=exp_data.role,
        start_date=exp_data.start_date,
        description=exp_data.description,
        end_date=exp_data.end_date,
        order_index=exp_data.order_index
    )


@router.put("/experiences/{exp_id}", response_model=schemas.ExperienceResponse)
async def update_existing_experience(
    exp_id: int,
    exp_data: schemas.ExperienceUpdate,
    portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository),
    admin: User = Depends(get_current_admin)
):
    use_cases = PortfolioUseCases(portfolio_repo)
    try:
        return await use_cases.update_experience(
            exp_id=exp_id,
            company=exp_data.company,
            role=exp_data.role,
            start_date=exp_data.start_date,
            description=exp_data.description,
            end_date=exp_data.end_date,
            order_index=exp_data.order_index
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/experiences/{exp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_experience(
    exp_id: int,
    portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository),
    admin: User = Depends(get_current_admin)
):
    use_cases = PortfolioUseCases(portfolio_repo)
    try:
        await use_cases.delete_experience(exp_id)
        return None
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# --- PROJECT ENDPOINTS ---

@router.get("/projects", response_model=List[schemas.ProjectResponse])
async def get_projects_list(portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository)):
    use_cases = PortfolioUseCases(portfolio_repo)
    return await use_cases.get_projects()


@router.post(
    "/projects",
    response_model=schemas.ProjectResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_new_project(
    proj_data: schemas.ProjectCreate,
    portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository),
    admin: User = Depends(get_current_admin)
):
    use_cases = PortfolioUseCases(portfolio_repo)
    return await use_cases.create_project(
        title=proj_data.title,
        description=proj_data.description,
        tech_tags=proj_data.tech_tags,
        repo_link=proj_data.repo_link,
        live_link=proj_data.live_link,
        order_index=proj_data.order_index
    )


@router.put("/projects/{proj_id}", response_model=schemas.ProjectResponse)
async def update_existing_project(
    proj_id: int,
    proj_data: schemas.ProjectUpdate,
    portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository),
    admin: User = Depends(get_current_admin)
):
    use_cases = PortfolioUseCases(portfolio_repo)
    try:
        return await use_cases.update_project(
            project_id=proj_id,
            title=proj_data.title,
            description=proj_data.description,
            tech_tags=proj_data.tech_tags,
            repo_link=proj_data.repo_link,
            live_link=proj_data.live_link,
            order_index=proj_data.order_index
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/projects/{proj_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_project(
    proj_id: int,
    portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository),
    admin: User = Depends(get_current_admin)
):
    use_cases = PortfolioUseCases(portfolio_repo)
    try:
        await use_cases.delete_project(proj_id)
        return None
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# --- TECHNOLOGY ENDPOINTS ---

@router.get("/technologies", response_model=List[schemas.TechnologyResponse])
async def get_technologies_list(portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository)):
    use_cases = PortfolioUseCases(portfolio_repo)
    return await use_cases.get_technologies()


@router.post(
    "/technologies",
    response_model=schemas.TechnologyResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_new_technology(
    tech_data: schemas.TechnologyCreate,
    portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository),
    admin: User = Depends(get_current_admin)
):
    use_cases = PortfolioUseCases(portfolio_repo)
    return await use_cases.create_technology(
        name=tech_data.name,
        category=tech_data.category,
        proficiency=tech_data.proficiency,
        icon_name=tech_data.icon_name,
        order_index=tech_data.order_index
    )


@router.put("/technologies/{tech_id}", response_model=schemas.TechnologyResponse)
async def update_existing_technology(
    tech_id: int,
    tech_data: schemas.TechnologyUpdate,
    portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository),
    admin: User = Depends(get_current_admin)
):
    use_cases = PortfolioUseCases(portfolio_repo)
    try:
        return await use_cases.update_technology(
            tech_id=tech_id,
            name=tech_data.name,
            category=tech_data.category,
            proficiency=tech_data.proficiency,
            icon_name=tech_data.icon_name,
            order_index=tech_data.order_index
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/technologies/{tech_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_technology(
    tech_id: int,
    portfolio_repo: IPortfolioRepository = Depends(get_portfolio_repository),
    admin: User = Depends(get_current_admin)
):
    use_cases = PortfolioUseCases(portfolio_repo)
    try:
        await use_cases.delete_technology(tech_id)
        return None
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
