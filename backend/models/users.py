from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base

class SchoolClass(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)

    teachers = relationship("Teacher", back_populates="school_class")
    students = relationship("Student", back_populates="school_class")


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"))
    hashed_password = Column(String, nullable=False)

    school_class = relationship("SchoolClass", back_populates="teachers")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"))

    school_class = relationship("SchoolClass", back_populates="students")

