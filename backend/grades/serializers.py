from rest_framework import serializers
from .models import GradeAssignment, ReviewRequest, QuestionGrade, Course
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError 
import re

User = get_user_model()



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
            'id',   #id gradeassignment
            'student', 
            'course',   #course name
            'grade_value', 
            'state',    #grading status
            'semester', #exam period
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

    def validate_semester(self, value): # Este es el método del serializador
        try:
            return validate_semester_format(value) # Llama a la función standalone
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages) # Convierte la excepción


#serializers simples para user y course

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User 
        fields = ['id', 'username', 'name']

class CourseSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course # Ase
        fields = ['id', 'title', 'code']

class GradeAssignmentForReviewSerializer(serializers.ModelSerializer):
    student = UserSimpleSerializer(read_only=True)
    course = CourseSimpleSerializer(read_only=True)
    # No incluimos 'instructor' aquí ya que estamos filtrando por el instructor que hace la petición.
    # Tampoco 'question_grades' a menos que sea estrictamente necesario para esta vista.

    class Meta:
        model = GradeAssignment
        fields = ['id', 'student', 'course', 'semester', 'grade_value', 'state']


class ReviewRequestSerializer(serializers.ModelSerializer):
    # Anidar el serializador de GradeAssignment para obtener sus detalles
    grade_assignment = GradeAssignmentForReviewSerializer(read_only=True)
    # Para 'responded_by', también podrías usar UserSimpleSerializer si quieres más que el ID
    responded_by = UserSimpleSerializer(read_only=True) 

    class Meta:
        model = ReviewRequest
        fields = [
            'id', 
            'grade_assignment', # Esto ahora incluirá student, course, semester
            'reason', 
            'submitted_at', 
            'response',         # El 'reply' que mencionaste
            'responded_at', 
            'responded_by'
        ]
        # read_only_fields se manejan por los serializadores anidados o por la lógica de la vista
        # 'submitted_at' es auto_now_add
        # 'response', 'responded_at', 'responded_by' se llenan al responder.


def validate_semester_format(value):
    """
    Valida que el semestre siga el formato "Spring YYYY-YYYY" o "Fall YYYY-YYYY",
    donde el segundo año es el primero + 1.
    Lanza DjangoValidationError en caso de error.
    """
    pattern = r"^(Spring|Fall) (\d{4})-(\d{4})$"
    match = re.fullmatch(pattern, value)

    if not match:
        raise DjangoValidationError(
            "El formato del semestre debe ser 'Spring YYYY-YYYY' o 'Fall YYYY-YYYY'."
        )

    period, year1_str, year2_str = match.groups()
    year1 = int(year1_str)
    year2 = int(year2_str)

    if year2 != year1 + 1:
        raise DjangoValidationError(
            f"El rango de años en el semestre no es consecutivo: {year1_str}-{year2_str}."
        )
    return value
