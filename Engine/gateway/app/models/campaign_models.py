from pydantic import BaseModel
from typing import Literal, Optional
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, text, Float
from app.db.session import Base
from sqlalchemy import Column, Integer, Text, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func



class CreateCampaignRequest(BaseModel):
    name: str
    difficulty: Literal["easy", "medium", "hard", "expert"]

    campaign_type: str

    target_type: Literal["organization", "department", "specific_users"]
    target_department: Optional[str] = None

    emails_per_user: int
    phishing_ratio: float


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)

    campaign_type = Column(String, nullable=False)

    target_type = Column(String, nullable=False)
    target_department = Column(String, nullable=True)

    emails_per_user = Column(Integer, nullable=False)
    phishing_ratio = Column(Float, nullable=False)

    active = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))


class CampaignTheme(Base):
    __tablename__ = "campaign_themes"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="CASCADE"))
    theme_text = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())