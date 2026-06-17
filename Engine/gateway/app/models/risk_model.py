from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func
from app.db.session import Base


class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    user_id = Column(Integer, primary_key=True)
    risk_score = Column(Integer, default=5)
    trend = Column(String, default="stable")
    total_clicks = Column(Integer, default=0)   # ← ADD
    total_reports = Column(Integer, default=0)  # ← ADD
    total_emails = Column(Integer, default=0)   # ← ADD
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())