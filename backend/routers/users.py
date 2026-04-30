from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import random

from db.database import get_db
from models.location import LocationLog
from models.users import Student, Teacher, SchoolClass
from schemas.users import StudentCreate, StudentResponse, TeacherResponse, SchoolClassResponse, SchoolClassCreate

# /users Defined all the routes related to students, teachers and classes
router = APIRouter(prefix="/users", tags=["Users"])

# Routers for classes - create and get all classes

@router.post("/classes", response_model=SchoolClassResponse)
def create_class(school_class: SchoolClassCreate, db: Session = Depends(get_db)):
    """Route for create a class"""
    existing_class = db.query(SchoolClass).filter(SchoolClass.name == school_class.name).first()
    if existing_class:
        raise HTTPException(status_code=400, detail="The class is still in the system")

    """Router to create a new school class."""
    new_class = SchoolClass(
        name=school_class.name
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

@router.get("/classes", response_model=List[SchoolClassResponse])
def get_classes(db: Session = Depends(get_db)):
    """Router to return all school classes."""
    return db.query(SchoolClass).all()


# Routers for students - create, get all, search by name, search by ID

@router.post("/student", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Router for create student"""
    existing_student = db.query(Student).filter(Student.id == student.id).first()
    if existing_student:
        raise HTTPException(status_code=400, detail="The ID is still in the system")

    new_student = Student(
        id=student.id,
        first_name=student.first_name,
        last_name=student.last_name,
        class_id=student.class_id
    )
    db.add(new_student)
    db.flush()

    base_lat = 31.7767
    base_lng = 35.2345

    initial_location = LocationLog(
        person_id=new_student.id,
        person_type="student",
        latitude=base_lat + random.uniform(-0.005, 0.005),
        longitude=base_lng + random.uniform(-0.005, 0.005)
    )
    db.add(initial_location)
    db.commit()
    db.refresh(new_student)
    return new_student

@router.get("/students", response_model=List[StudentResponse])
def get_all_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()

    results = []

    for student in students:
        class_name = student.school_class.name if student.school_class else "Unknown"

        results.append({
            "id": student.id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "class_id": student.class_id,
            "class_name": class_name
        })

    return results

# Router for search students by name
@router.get("/students/search", response_model=List[StudentResponse])
def search_students(name: str, db: Session = Depends(get_db)):
    students = db.query(Student).filter(
        (Student.first_name.ilike(f"%{name}%")) |
        (Student.last_name.ilike(f"%{name}%"))
    ).all()

    if not students:
        raise HTTPException(status_code=404, detail="The student not found")

    return students

# Router for search students by id
@router.get("/students/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="The student not found")

    return student

# Routers for teachers - get all, search by name, search by ID
@router.get("/teachers", response_model=List[TeacherResponse])
def get_all_teachers(db: Session = Depends(get_db)):
    """Router to return all teachers."""
    teachers = db.query(Teacher).all()

    results = []

    for teacher in teachers:
        class_name = teacher.school_class.name if teacher.school_class else "Unknown"

        teacher_dict = {
            "id": teacher.id,
            "first_name": teacher.first_name,
            "last_name": teacher.last_name,
            "class_id": teacher.class_id,
            "class_name": class_name
        }
        results.append(teacher_dict)

    return results

@router.get("/teachers/search", response_model=List[StudentResponse])
def search_students(name: str, db: Session = Depends(get_db)):
    """Router for search teachers by name."""
    teachers = db.query(Teacher).filter(
        (Teacher.first_name.ilike(f"%{name}%")) |
        (Teacher.last_name.ilike(f"%{name}%"))
    ).all()

    if not teachers:
        raise HTTPException(status_code=404, detail="The teacher not found")

    return teachers

@router.get("/teachers/{teacher_id}", response_model=TeacherResponse)
def get_teacher(teacher_id: int, db: Session = Depends(get_db)):
    """Router for search teachers by id."""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()

    if not teacher:
        raise HTTPException(status_code=404, detail="The teacher not found")

    return teacher


@router.get("/my-students", response_model=List[StudentResponse])
def get_my_students(teacher_id: int, db: Session = Depends(get_db)):
    """Router to return all students of the teacher's class."""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="The teacher not found")

    if not teacher.school_class:
        return []

    class_name = teacher.school_class.name
    students = teacher.school_class.students

    results = []

    for student in students:
        student_dict = {
            "id": student.id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "class_id": student.class_id,
            "class_name": class_name
        }

        results.append(student_dict)

    return results