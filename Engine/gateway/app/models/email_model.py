from sqlalchemy import Column, Integer, Text, Boolean, TIMESTAMP, ForeignKey, JSON
from sqlalchemy.sql import func
from app.db.session import Base


class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)

    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    subject = Column(Text, nullable=False)
    body = Column(Text, nullable=False)

    attack_metadata = Column(JSON, nullable=True)

    is_phishing = Column(Boolean, nullable=False)

    
    sequence_number = Column(Integer, nullable=True)
    theme_used = Column(Text, nullable=True)

    delivered = Column(Boolean, default=True)

    created_at = Column(TIMESTAMP, server_default=func.now())