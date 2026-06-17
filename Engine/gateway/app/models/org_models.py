# from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, text
# from sqlalchemy.dialects.postgresql import JSONB
# from app.db.session import Base
# from pydantic import BaseModel
# from typing import Optional


# class OrgStyleProfile(Base):
#     __tablename__ = "org_style_profile"

#     id = Column(Integer, primary_key=True, index=True)
#     greeting_style = Column(Text, nullable=True)
#     signoff_style = Column(Text, nullable=True)
#     tone = Column(Text, nullable=True)
#     common_phrases = Column(JSONB, nullable=True)
#     raw_sample_count = Column(Integer, nullable=True)
#     phishing_sample_count = Column(Integer, default=0)  # ← NEW
#     created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
#     updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))


# class OrgStyleResponse(BaseModel):
#     configured: bool
#     greeting_style: Optional[str] = None
#     signoff_style: Optional[str] = None
#     tone: Optional[str] = None
#     common_phrases: Optional[list] = None
#     raw_sample_count: Optional[int] = None
#     phishing_sample_count: Optional[int] = None  # ← NEW
from sqlalchemy import Column, Integer, Text, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import JSONB
from app.db.session import Base
from pydantic import BaseModel
from typing import Optional, List

class OrgStyleProfile(Base):
    __tablename__ = "org_style_profile"
    id                    = Column(Integer, primary_key=True, index=True)
    greeting_style        = Column(Text, nullable=True)
    signoff_style         = Column(Text, nullable=True)
    tone                  = Column(Text, nullable=True)
    common_phrases        = Column(JSONB, nullable=True)
    raw_sample_count      = Column(Integer, nullable=True)
    phishing_sample_count = Column(Integer, default=0)
    internal_samples      = Column(JSONB, default=list)   # raw internal email bodies
    phishing_samples      = Column(JSONB, default=list)   # raw phishing .eml bodies
    created_at            = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at            = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

class OrgStyleResponse(BaseModel):
    configured:            bool
    greeting_style:        Optional[str]  = None
    signoff_style:         Optional[str]  = None
    tone:                  Optional[str]  = None
    common_phrases:        Optional[list] = None
    raw_sample_count:      Optional[int]  = None
    phishing_sample_count: Optional[int]  = None
    internal_samples:      Optional[List[str]] = None
    phishing_samples:      Optional[List[str]] = None