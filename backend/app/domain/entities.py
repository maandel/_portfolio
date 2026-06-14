from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class User:
    email: str
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    id: Optional[int] = None


@dataclass
class Bio:
    name: str
    title: str
    about_me: str
    email: str
    resume_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    avatar_url: Optional[str] = None
    id: Optional[int] = None


@dataclass
class Experience:
    company: str
    role: str
    start_date: str
    description: str
    end_date: Optional[str] = None
    order_index: int = 0
    id: Optional[int] = None


@dataclass
class Project:
    title: str
    description: str
    tech_tags: List[str] = field(default_factory=list)
    repo_link: Optional[str] = None
    live_link: Optional[str] = None
    order_index: int = 0
    id: Optional[int] = None


@dataclass
class Technology:
    name: str
    category: str
    proficiency: Optional[int] = None
    icon_name: Optional[str] = None
    order_index: int = 0
    id: Optional[int] = None


@dataclass
class ContactMessage:
    name: str
    email: str
    message: str
