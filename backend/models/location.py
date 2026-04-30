from sqlalchemy import Column, Integer, String, Float, DateTime
from db.database import Base


class LocationLog(Base):
    __tablename__ = "location_logs"

    id = Column(Integer, primary_key=True, index=True)

    person_id = Column(Integer, index=True, nullable=False)

    person_type = Column(String)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    timestamp = Column(DateTime(timezone=True))
