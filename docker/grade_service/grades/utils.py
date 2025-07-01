import requests
from django.conf import settings
from rest_framework import status

COURSE_SERVICE_URL = getattr(settings, 'COURSE_SERVICE_URL', 'http://course_service:8002')

def get_course(course_id):
    try:
        response = requests.get(
            f"{COURSE_SERVICE_URL}/api/courses/{course_id}/",
            headers={'Content-Type': 'application/json'}
        )
        if response.status_code == status.HTTP_200_OK:
            return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error getting course: {e}")
    return None

def get_course_by_title(title):
    try:
        response = requests.get(
            f"{COURSE_SERVICE_URL}/api/courses/?title={title}",
            headers={'Content-Type': 'application/json'}
        )
        if response.status_code == status.HTTP_200_OK:
            courses = response.json()
            if courses:
                return courses[0]  # return first matching course
    except requests.exceptions.RequestException as e:
        print(f"Error getting course by title: {e}")
    return None