from pydantic import BaseModel, EmailStr
from typing import Literal
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, text
from app.db.session import Base


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    role: Literal["user", "admin", "soc"]
    department: str


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    department = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    must_change_password = Column(Boolean, default=False)  # ← ADDED
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))


class InteractionRequest(BaseModel):
    email_id: int
    action: Literal["opened", "clicked", "downloaded", "reported", "ignored"]