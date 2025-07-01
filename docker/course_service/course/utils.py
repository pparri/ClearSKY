import requests
from django.conf import settings
import json
from rest_framework import status

GRADE_SERVICE_URL = getattr(settings, 'GRADE_SERVICE_URL', 'http://grade_service:8003')

def get_grade_assignments_for_course(course_id=None, student_id=None, submission_type=None):
    params = {}
    if course_id:
        params['course_id'] = course_id
    if student_id:
        params['student_id'] = student_id
    if submission_type:
        params['submission_type'] = submission_type
        
    try:
        response = requests.get(
            f"{GRADE_SERVICE_URL}/api/grades/",
            params=params,
            headers={'Content-Type': 'application/json'}
        )
        if response.status_code == status.HTTP_200_OK:
            return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to grade service: {e}")
    return []

def get_review_requests_for_student(student_id):
    try:
        response = requests.get(
            f"{GRADE_SERVICE_URL}/api/reviews/?student_id={student_id}",
            headers={'Content-Type': 'application/json'}
        )
        if response.status_code == status.HTTP_200_OK:
            return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error getting review requests: {e}")
    return []