# course/serializers.py

from rest_framework import serializers
from .models import Course
from .models import ReviewRequest
from django.contrib.auth import get_user_model

User = get_user_model()

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'code', 'title', 'email', 'institution', 'instructors']
#necesitamos code xq id ya lo crea por defecto django