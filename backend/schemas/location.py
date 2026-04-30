from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DMS(BaseModel):
    Degrees: float
    Minutes: float
    Seconds: float

class Coordinates(BaseModel):
    Longitude: DMS
    Latitude: DMS

class LocationPayload(BaseModel):
    ID: int
    Coordinates: Coordinates
    Timestamp: Optional[datetime] = None

class LocationLogResponse(BaseModel):
    id: int
    person_id: int
    person_type: str
    latitude: float
    longitude: float
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True
