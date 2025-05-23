from rest_framework import serializers
from .models import GradeAssignment, ReviewRequest

class GradeAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeAssignment
        fields = '__all__'
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


