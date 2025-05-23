from rest_framework import serializers
from .models import GradeAssignment, ReviewRequest, QuestionGrade, Course


class QuestionGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionGrade
        fields = ['id', 'question_number', 'value'] # O los campos que quieras mostrar

class GradeAssignmentSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField() # O un serializador de User más detallado si lo prefieres
    course = serializers.StringRelatedField() # O un serializador de Course más detallado
    question_grades = QuestionGradeSerializer(many=True, read_only=True) 

    class Meta:
        model = GradeAssignment
        fields = [
            'student', 
            'course', 
            'grade_value', 
            'state', 
            'semester',
            'question_grades'
        ]
        read_only_fields = ['timestamp', 'instructor']  # instructor lo setea la vista

        def validate_student(self, value):
            if value.role != 'student':
                raise serializers.ValidationError("El usuario seleccionado no es un estudiante.")
            return value
        
        def validate_instructor(self, value):
            if value and value.role != 'instructor':
                raise serializers.ValidationError("El usuario seleccionado no es un instructor.")
            return value

class ReviewRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewRequest
        fields = '__all__'
        read_only_fields = ['submitted_at', 'responded_at', 'responded_by']

