from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from db.database import get_db
import random

from models.location import LocationLog
from models.users import Teacher, SchoolClass
from schemas.users import TeacherRegister, TeacherResponse, TeacherLogin
import bcrypt

router = APIRouter(prefix="/auth", tags=["Authentication"])

def generate_password_hash(raw_password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(raw_password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

@router.post("/register", response_model=TeacherResponse)
def register_teacher_account(teacher_data: TeacherRegister, db: Session = Depends(get_db)):
    """Router for teacher registration - creates a new teacher"""
    existing_teacher = db.query(Teacher).filter(Teacher.id == teacher_data.id).first()
    if existing_teacher:
        raise HTTPException(status_code=400, detail="Teacher ID is already registered")

    target_class = db.query(SchoolClass).filter(SchoolClass.id == teacher_data.class_id).first()
    if not target_class:
        raise HTTPException(status_code=404, detail="Target class not found")

    secure_password = generate_password_hash(teacher_data.password)

    new_teacher = Teacher(
        id=teacher_data.id,
        first_name=teacher_data.first_name,
        last_name=teacher_data.last_name,
        class_id=teacher_data.class_id,
        hashed_password=secure_password
    )

    db.add(new_teacher)
    db.flush()

    base_lat = 31.7767
    base_lng = 35.2345

    initial_location = LocationLog(
        person_id=new_teacher.id,
        person_type="teacher",
        latitude=base_lat + random.uniform(-0.005, 0.005),
        longitude=base_lng + random.uniform(-0.005, 0.005)
    )
    db.add(initial_location)
    db.commit()
    db.refresh(new_teacher)

    return TeacherResponse(
        id=new_teacher.id,
        first_name=new_teacher.first_name,
        last_name=new_teacher.last_name,
        class_id=new_teacher.class_id,
        full_name=f"{new_teacher.first_name} {new_teacher.last_name}",
        class_name=target_class.name
    )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@router.post("/login")
def authenticate_teacher_session(login_data: TeacherLogin, response: Response = None, db: Session = Depends(get_db)):
    """Router for login"""
    teacher = db.query(Teacher).filter(Teacher.id == login_data.id).first()

    if not teacher or not verify_password(login_data.password, teacher.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid ID or password")

    class_name = ""
    if teacher.class_id:
        school_class = db.query(SchoolClass).filter(SchoolClass.id == teacher.class_id).first()
        if school_class:
            class_name = school_class.name

    return {
        "message": "Auth successful",
        "teacher_name": f"{teacher.first_name} {teacher.last_name}",
        "id": teacher.id,
        "class_name": class_name
    }

@router.post("/logout")
def terminate_teacher_session(response: Response):
    """Router for logout"""
    return {"message": "Logged out successfully"}
