from typing import List

from app.domain import schemas
from app.domain.entities import User
from app.domain.interfaces import IUserRepository
from app.interfaces.api.dependencies import get_current_admin, get_user_repository
from app.use_cases.auth_use_cases import AuthUseCases
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    "/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED
)
async def create_user(
    user_data: schemas.UserCreateAdmin,
    current_admin: User = Depends(get_current_admin),
    user_repo: IUserRepository = Depends(get_user_repository),
):
    use_cases = AuthUseCases(user_repo)
    try:
        user = await use_cases.create_user(
            email=user_data.email,
            password=user_data.password,
            is_admin=user_data.is_admin,
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[schemas.UserResponse])
async def list_users(
    current_admin: User = Depends(get_current_admin),
    user_repo: IUserRepository = Depends(get_user_repository),
):
    users = await user_repo.list_users()
    return users


@router.put("/{user_id}/status", response_model=schemas.UserResponse)
async def update_user_status(
    user_id: int,
    status_data: schemas.UserStatusUpdate,
    current_admin: User = Depends(get_current_admin),
    user_repo: IUserRepository = Depends(get_user_repository),
):
    if current_admin.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot deactivate your own administrative account.",
        )

    updated_user = await user_repo.update_status(user_id, status_data.is_active)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user


@router.put("/{user_id}", response_model=schemas.UserResponse)
async def update_user(
    user_id: int,
    user_data: schemas.UserUpdate,
    current_admin: User = Depends(get_current_admin),
    user_repo: IUserRepository = Depends(get_user_repository),
):
    if current_admin.id == user_id and user_data.is_admin is False:
        raise HTTPException(
            status_code=400,
            detail="You cannot revoke your own administrative privileges.",
        )

    use_cases = AuthUseCases(user_repo)
    try:
        user = await use_cases.update_user(
            user_id=user_id,
            email=user_data.email,
            password=user_data.password,
            is_admin=user_data.is_admin,
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    user_repo: IUserRepository = Depends(get_user_repository),
):
    if current_admin.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own administrative account.",
        )

    success = await user_repo.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User successfully deleted"}
