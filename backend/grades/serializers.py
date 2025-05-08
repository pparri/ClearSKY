from rest_framework import serializers
from .models import GradeAssignment

class GradeAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeAssignment
        fields = '__all__'