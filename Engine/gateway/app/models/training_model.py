from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, text, ForeignKey
from app.db.session import Base
from pydantic import BaseModel
from typing import Optional


class TrainingContent(Base):
    __tablename__ = "training_content"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content_type = Column(String, nullable=True)
    file_path = Column(Text, nullable=True)
    w3_content = Column(Text, nullable=True)
    topic = Column(String, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))


class CreateTrainingRequest(BaseModel):
    title: str
    content_type: str
    w3_content: Optional[str] = None
    topic: Optional[str] = None
    file_path: Optional[str] = None