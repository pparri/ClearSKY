# course/serializers.py

from rest_framework import serializers
from .models import Course
from django.contrib.auth import get_user_model

User = get_user_model()

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'course_id', 'title', 'email', 'password', 'institution', 'instructors']
