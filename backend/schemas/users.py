from pydantic import BaseModel
from typing import Optional

class SchoolClassBase(BaseModel):
    name: str

class SchoolClassCreate(SchoolClassBase):
    pass

class SchoolClassResponse(SchoolClassBase):
    id: int
    name: str

    class Config:
        from_attributes = True

class StudentBase(BaseModel):
    first_name: str
    last_name: str
    class_id: int

class StudentCreate(StudentBase):
    id: int

class StudentResponse(StudentBase):
    id: int
    full_name: Optional[str] = None
    class_name: Optional[str] = None

    class Config:
        from_attributes = True

class TeacherBase(BaseModel):
    first_name: str
    last_name: str
    class_id: int

class TeacherRegister(TeacherBase):
    id: int
    password: str

class TeacherResponse(TeacherBase):
    id: int
    full_name: Optional[str] = None
    class_name: Optional[str] = None

    class Config:
        from_attributes = True

class TeacherLogin(BaseModel):
    id: int
    password: str
