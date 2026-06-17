#from sqlalchemy import Column, Integer, String, TIMESTAMP,JSON  # new from ahmed Added: JSON
from sqlalchemy import Column, Integer, String, TIMESTAMP, JSON, Text
from sqlalchemy.sql import func
from app.db.session import Base




class Interaction(Base):
    __tablename__ = "interactions"


    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    email_id = Column(Integer)
    action = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())


    #New from ahmed Added: Explanation model for SOC user detail route
# class Explanation(Base):
#     __tablename__ = "explanations"


#     id = Column(Integer, primary_key=True)
#     email_id = Column(Integer)
#     user_id = Column(Integer)
#     explanation = Column(JSON)
#     created_at = Column(TIMESTAMP, server_default=func.now())


    #Ahmed

class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(Integer, primary_key=True)
    email_id = Column(Integer)
    user_id = Column(Integer)
    explanation = Column(JSON)

    ai_message = Column(Text)   # 🔥 ADD THIS

    created_at = Column(TIMESTAMP, server_default=func.now())