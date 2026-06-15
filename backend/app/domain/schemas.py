from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(
        ..., min_length=6, description="Password must be at least 6 characters"
    )


class UserCreateAdmin(BaseModel):
    email: EmailStr
    password: str = Field(
        ..., min_length=6, description="Password must be at least 6 characters"
    )
    is_admin: bool = False


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(
        None, min_length=6, description="Password must be at least 6 characters"
    )
    is_admin: Optional[bool] = None


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")
    new_password: str = Field(..., min_length=6)


class BioBase(BaseModel):
    name: str
    title: str
    about_me: str
    resume_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    email: EmailStr
    avatar_url: Optional[str] = None

    @field_validator(
        "resume_url",
        "github_url",
        "linkedin_url",
        "twitter_url",
        "avatar_url",
        mode="before",
    )
    @classmethod
    def validate_url_scheme(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "" or v == "#":
            return None
        try:
            from urllib.parse import urlparse

            parsed = urlparse(v)
            scheme = parsed.scheme.lower()
            if scheme not in ("http", "https") or not parsed.netloc:
                raise ValueError(
                    "URL must be a valid absolute HTTP or HTTPS URL with a domain"
                )
        except ValueError:
            raise
        except Exception:
            raise ValueError("Invalid URL format")
        return v


class BioCreate(BioBase):
    pass


class BioUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    about_me: Optional[str] = None
    resume_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None

    @field_validator(
        "resume_url",
        "github_url",
        "linkedin_url",
        "twitter_url",
        "avatar_url",
        mode="before",
    )
    @classmethod
    def validate_url_scheme(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "" or v == "#":
            return None
        try:
            from urllib.parse import urlparse

            parsed = urlparse(v)
            scheme = parsed.scheme.lower()
            if scheme not in ("http", "https") or not parsed.netloc:
                raise ValueError(
                    "URL must be a valid absolute HTTP or HTTPS URL with a domain"
                )
        except ValueError:
            raise
        except Exception:
            raise ValueError("Invalid URL format")
        return v


class BioResponse(BioBase):
    id: int

    class Config:
        from_attributes = True


class ExperienceBase(BaseModel):
    company: str
    role: str
    start_date: str
    end_date: Optional[str] = None
    description: str
    order_index: int = 0


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None


class ExperienceResponse(ExperienceBase):
    id: int

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    title: str
    description: str
    tech_tags: List[str]
    repo_link: Optional[str] = None
    live_link: Optional[str] = None
    order_index: int = 0

    @field_validator("repo_link", "live_link", mode="before")
    @classmethod
    def validate_link_scheme(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "" or v == "#":
            return None
        try:
            from urllib.parse import urlparse

            parsed = urlparse(v)
            scheme = parsed.scheme.lower()
            if scheme not in ("http", "https") or not parsed.netloc:
                raise ValueError(
                    "URL must be a valid absolute HTTP or HTTPS URL with a domain"
                )
        except ValueError:
            raise
        except Exception:
            raise ValueError("Invalid URL format")
        return v


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tech_tags: Optional[List[str]] = None
    repo_link: Optional[str] = None
    live_link: Optional[str] = None
    order_index: Optional[int] = None

    @field_validator("repo_link", "live_link", mode="before")
    @classmethod
    def validate_link_scheme(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "" or v == "#":
            return None
        try:
            from urllib.parse import urlparse

            parsed = urlparse(v)
            scheme = parsed.scheme.lower()
            if scheme not in ("http", "https") or not parsed.netloc:
                raise ValueError(
                    "URL must be a valid absolute HTTP or HTTPS URL with a domain"
                )
        except ValueError:
            raise
        except Exception:
            raise ValueError("Invalid URL format")
        return v


class ProjectResponse(ProjectBase):
    id: int

    class Config:
        from_attributes = True


class TechnologyBase(BaseModel):
    name: str
    category: str
    proficiency: Optional[int] = Field(None, ge=0, le=100)
    icon_name: Optional[str] = None
    order_index: int = 0


class TechnologyCreate(TechnologyBase):
    pass


class TechnologyUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    proficiency: Optional[int] = None
    icon_name: Optional[str] = None
    order_index: Optional[int] = None


class TechnologyResponse(TechnologyBase):
    id: int

    class Config:
        from_attributes = True


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    message: str
