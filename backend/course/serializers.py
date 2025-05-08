# course/serializers.py
from rest_framework import serializers
from .models import Course, Grade

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['id', 'student', 'value', 'review_requested', 'review_response']

class CourseSerializer(serializers.ModelSerializer):
    initial_grades = GradeSerializer(many=True, read_only=True)
    final_grades = GradeSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'name', 'instructor', 'institution', 'grade_state', 'initial_grades', 'final_grades', 'created_at']
