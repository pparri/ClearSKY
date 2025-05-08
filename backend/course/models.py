from django.db import models
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel

class GradeState(str, Enum):
    VOID = "VOID"
    OPEN = "OPEN"
    FINAL = "FINAL"

class Grade(models.Model):
    student_id: str
    value: float
    review_requested: bool = False
    review_response: Optional[str] = None

class Course(models.Model):
    id: str
    name: str
    instructor_id: str
    institution_id: str
    grade_state: GradeState = GradeState.VOID
    initial_grades: List[Grade] = []
    final_grades: List[Grade] = []
