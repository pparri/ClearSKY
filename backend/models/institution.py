from sqlalchemy import Column, Integer, String
from db.database import Base

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    representative_email = Column(String, unique=True, index=True)
