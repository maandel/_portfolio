from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities import Bio, Experience, Project, Technology, User


class IUserRepository(ABC):
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    async def create(self, user: User) -> User:
        pass

    @abstractmethod
    async def update_password(self, email: str, hashed_password: str) -> User:
        pass


class IPortfolioRepository(ABC):
    @abstractmethod
    async def get_bio(self) -> Optional[Bio]:
        pass

    @abstractmethod
    async def update_or_create_bio(self, bio: Bio) -> Bio:
        pass

    @abstractmethod
    async def get_experiences(self) -> List[Experience]:
        pass

    @abstractmethod
    async def get_experience_by_id(self, exp_id: int) -> Optional[Experience]:
        pass

    @abstractmethod
    async def create_experience(self, exp: Experience) -> Experience:
        pass

    @abstractmethod
    async def update_experience(
        self, exp_id: int, exp: Experience
    ) -> Optional[Experience]:
        pass

    @abstractmethod
    async def delete_experience(self, exp_id: int) -> bool:
        pass

    @abstractmethod
    async def get_projects(self) -> List[Project]:
        pass

    @abstractmethod
    async def get_project_by_id(self, project_id: int) -> Optional[Project]:
        pass

    @abstractmethod
    async def create_project(self, project: Project) -> Project:
        pass

    @abstractmethod
    async def update_project(
        self, project_id: int, project: Project
    ) -> Optional[Project]:
        pass

    @abstractmethod
    async def delete_project(self, project_id: int) -> bool:
        pass

    @abstractmethod
    async def get_technologies(self) -> List[Technology]:
        pass

    @abstractmethod
    async def get_technology_by_id(self, tech_id: int) -> Optional[Technology]:
        pass

    @abstractmethod
    async def create_technology(self, tech: Technology) -> Technology:
        pass

    @abstractmethod
    async def update_technology(
        self, tech_id: int, tech: Technology
    ) -> Optional[Technology]:
        pass

    @abstractmethod
    async def delete_technology(self, tech_id: int) -> bool:
        pass


class IOTPStore(ABC):
    @abstractmethod
    async def set_otp(self, email: str, otp: str, ttl_seconds: int) -> None:
        pass

    @abstractmethod
    async def get_otp(self, email: str) -> Optional[str]:
        pass

    @abstractmethod
    async def delete_otp(self, email: str) -> None:
        pass

    @abstractmethod
    async def set_verified_flag(self, email: str, ttl_seconds: int) -> None:
        pass

    @abstractmethod
    async def get_verified_flag(self, email: str) -> bool:
        pass

    @abstractmethod
    async def delete_verified_flag(self, email: str) -> None:
        pass


class IEmailService(ABC):
    @abstractmethod
    async def send_otp(self, email: str, otp: str) -> None:
        pass

    @abstractmethod
    async def send_contact_message(self, name: str, email: str, message: str) -> None:
        pass
