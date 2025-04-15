from rest_framework import serializers
from .models import Institution

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name', 'email', 'representative']
        read_only_fields = ['representative']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['representative'] = request.user
        return super().create(validated_data)