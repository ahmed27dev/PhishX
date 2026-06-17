from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean, TIMESTAMP, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base


class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    user_id = Column(Integer, primary_key=True)
    risk_score = Column(Integer, default=5)
    trend = Column(String)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    email_id = Column(Integer)
    action = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())


class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True)
    campaign_id = Column(Integer)
    user_id = Column(Integer)
    subject = Column(Text)
    body = Column(Text)
    attack_metadata = Column(JSON)
    is_phishing = Column(Boolean)
    created_at = Column(TIMESTAMP, server_default=func.now())
    sequence_number = Column(Integer, nullable=True)
    theme_used = Column(Text, nullable=True)

    

# class Explanation(Base):
#     __tablename__ = "explanations"

#     id = Column(Integer, primary_key=True)
#     email_id = Column(Integer)
#     user_id = Column(Integer)
#     explanation = Column(JSON)
#     created_at = Column(TIMESTAMP, server_default=func.now())


class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(Integer, primary_key=True)
    email_id = Column(Integer)
    user_id = Column(Integer)

    explanation = Column(JSON)

    # 🔥 THIS MUST EXIST HERE
    ai_message = Column(Text)

    created_at = Column(TIMESTAMP, server_default=func.now())
