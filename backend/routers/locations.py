from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List
import random

from core.calculations import check_distance
from db.database import get_db
from models.location import LocationLog
from schemas.location import LocationPayload, LocationLogResponse, Coordinates, DMS
from models.users import Student, Teacher, SchoolClass

from geopy.geocoders import Nominatim
router = APIRouter(prefix="/tracking", tags=["Tracking"])

def dms_to_decimal(dms) -> float:
    return dms.Degrees + (dms.Minutes / 60) + (dms.Seconds / 3600)


def decimal_to_dms(decimal_deg: float) -> dict:
    degrees = int(decimal_deg)
    minutes_float = abs(decimal_deg - degrees) * 60
    minutes = int(minutes_float)
    seconds = int(round((minutes_float - minutes) * 60))

    return {
        "Degrees": str(degrees),
        "Minutes": str(minutes),
        "Seconds": str(seconds)
    }

geolocator = Nominatim(user_agent="trip_organizer")

def generate_random_payload(person_id: int, current_lat: float, current_lon: float) -> LocationPayload:
    new_lat = current_lat + random.uniform(-0.001, 0.001)
    new_lon = current_lon + random.uniform(-0.001, 0.001)

    return LocationPayload(
        ID=person_id,
        Coordinates=Coordinates(
            Latitude=decimal_to_dms(new_lat),
            Longitude=decimal_to_dms(new_lon)
        ),
        Timestamp=datetime.now(timezone.utc)
    )


@router.post("/location", response_model=LocationLogResponse)
def receive_device_location(payload: LocationPayload, db: Session = Depends(get_db)):
    """Router for enter a new location"""
    person_type = "unknown"


    is_student = db.query(Student).filter(Student.id == payload.ID).first()
    if is_student:
        person_type = "student"
    else:
        is_teacher = db.query(Teacher).filter(Teacher.id == payload.ID).first()
        if is_teacher:
            person_type = "teacher"

    if person_type == "unknown":
        raise HTTPException(status_code=404, detail="ID not in the system")

    dec_lat = dms_to_decimal(payload.Coordinates.Latitude)
    dec_lon = dms_to_decimal(payload.Coordinates.Longitude)

    new_log = LocationLog(
        person_id=payload.ID,
        person_type=person_type,
        latitude=dec_lat,
        longitude=dec_lon,
        timestamp=datetime.now(timezone.utc)
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return new_log

# Router for get all locations
@router.get("/locations", response_model=List[LocationLogResponse])
def get_all_locations(db: Session = Depends(get_db)):
    return db.query(LocationLog).all()

@router.get("/latest-locations")
def get_latest_locations(db: Session = Depends(get_db)):
    """# Router for to get only the latest location."""
    classes_dict = {c.id: c.name for c in db.query(SchoolClass).all()}

    results = db.query(
        LocationLog.latitude,
        LocationLog.longitude,
        LocationLog.person_id,
        LocationLog.person_type,
        LocationLog.timestamp,
        Student.first_name.label("s_first"),
        Student.last_name.label("s_last"),
        Student.class_id.label("s_class"),
        Teacher.first_name.label("t_first"),
        Teacher.last_name.label("t_last"),
        Teacher.class_id.label("t_class")
    ).outerjoin(
        Student, (LocationLog.person_id == Student.id) & (LocationLog.person_type == "student")
    ).outerjoin(
        Teacher, (LocationLog.person_id == Teacher.id) & (LocationLog.person_type == "teacher")
    ).all()

    final_locations = []
    for r in results:
        if r.person_type == "teacher":
            name = f"{r.t_first} {r.t_last}"
            class_name = classes_dict.get(r.t_class, "Unknown")
        else:
            name = f"{r.s_first} {r.s_last}"
            class_name = classes_dict.get(r.s_class, "Unknown")

        final_locations.append({
            "lat": r.latitude,
            "lng": r.longitude,
            "person_id": r.person_id,
            "person_type": r.person_type,
            "name": name,
            "class_name": class_name,
            "timestamp": r.timestamp
        })

    return final_locations

@router.post("/simulate-movement")
def simulate_movement(db: Session = Depends(get_db)):
    """Router for simulate movement of all users."""
    locations = db.query(LocationLog).all()

    for loc in locations:
        payload = generate_random_payload(loc.person_id, loc.latitude, loc.longitude)

        loc.latitude = dms_to_decimal(payload.Coordinates.Latitude)
        loc.longitude = dms_to_decimal(payload.Coordinates.Longitude)
        loc.timestamp = payload.Timestamp

    db.commit()

    return {"status": "success"}


@router.get("/alerts/{teacher_id}")
def get_teacher_alerts(teacher_id: int, db: Session = Depends(get_db)):
    """Router for get alerts for a teacher."""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        return {"alerts": []}

    teacher_loc = db.query(LocationLog).filter(LocationLog.person_id == teacher_id).first()
    if not teacher_loc:
        return {"alerts": []}

    students = db.query(Student).filter(Student.class_id == teacher.class_id).all()
    if not students:
        return {"alerts": []}

    student_ids = [s.id for s in students]
    student_locations = db.query(LocationLog).filter(LocationLog.person_id.in_(student_ids)).all()

    alerts = []

    for loc in student_locations:
        dist = check_distance(teacher_loc.latitude, teacher_loc.longitude, loc.latitude, loc.longitude)

        if dist > 0.8:
            student_info = next((s for s in students if s.id == loc.person_id), None)
            if student_info:
                alerts.append({
                    "id": student_info.id,
                    "name": f"{student_info.first_name} {student_info.last_name}",
                    "distance": round(dist, 2)
                })

    return {"alerts": alerts}