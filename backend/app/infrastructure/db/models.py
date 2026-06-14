from sqlalchemy import JSON, Boolean, Column, Integer, String, Text
from app.infrastructure.db.session import Base

class UserDb(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=True)

class BioDb(Base):
    __tablename__ = "bios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    about_me = Column(Text, nullable=False)
    resume_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    email = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)

class ExperienceDb(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    order_index = Column(Integer, default=0)

class ProjectDb(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    tech_tags = Column(JSON, nullable=False)  # List of tech strings
    repo_link = Column(String, nullable=True)
    live_link = Column(String, nullable=True)
    order_index = Column(Integer, default=0)

class TechnologyDb(Base):
    __tablename__ = "technologies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False)  # Frontend, Backend, Tools, etc.
    proficiency = Column(Integer, nullable=True)
    icon_name = Column(String, nullable=True)
    order_index = Column(Integer, default=0)
