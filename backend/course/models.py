from django.db import models
from enum import Enum
from typing import List, Dict
from datetime import datetime

class GradeState(Enum):
    VOID = "VOID"        # No grades posted
    OPEN = "OPEN"        # Initial grades posted, under review
    FINAL = "FINAL"      # Final grades posted

class Grade:
    def __init__(self, student_id: str, value: float):
        self.student_id = student_id
        self.value = value
        self.review_requested = False
        self.review_response = None  # String or could be an enum

class Course:
    def __init__(self, course_id: str, name: str, instructor_id: str, institution_id: str):
        self.course_id = course_id
        self.name = name
        self.instructor_id = instructor_id
        self.institution_id = institution_id
        self.created_at = datetime.utcnow()
        self.grade_state = GradeState.VOID
        self.initial_grades: Dict[str, Grade] = {}
        self.final_grades: Dict[str, float] = {}

    def upload_initial_grades(self, grades_from_excel: Dict[str, float]):
        if self.grade_state != GradeState.VOID:
            raise Exception("Initial grades already uploaded or finalized")
        for student_id, value in grades_from_excel.items():
            self.initial_grades[student_id] = Grade(student_id, value)
        self.grade_state = GradeState.OPEN

    def request_review(self, student_id: str):
        if student_id not in self.initial_grades:
            raise Exception("No grade found for this student")
        self.initial_grades[student_id].review_requested = True

    def respond_review(self, student_id: str, response: str, new_grade: float = None):
        if student_id not in self.initial_grades:
            raise Exception("No grade found for this student")
        grade = self.initial_grades[student_id]
        if not grade.review_requested:
            raise Exception("No review requested")
        grade.review_response = response
        if new_grade is not None:
            grade.value = new_grade

    def upload_final_grades(self):
        if self.grade_state != GradeState.OPEN:
            raise Exception("Cannot finalize. Either already final or no initial grades")
        for student_id, grade in self.initial_grades.items():
            self.final_grades[student_id] = grade.value
        self.grade_state = GradeState.FINAL

    def get_statistics(self):
        if self.grade_state == GradeState.VOID:
            return {}
        grades = list(self.final_grades.values()) if self.grade_state == GradeState.FINAL else [
            g.value for g in self.initial_grades.values()]
        return {
            "min": min(grades),
            "max": max(grades),
            "average": sum(grades) / len(grades) if grades else 0,
            "count": len(grades)
        }

