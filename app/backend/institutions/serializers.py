from rest_framework import serializers
from .models import Institution
from django.contrib.auth import get_user_model

User = get_user_model()

class InstitutionSerializer(serializers.ModelSerializer):
    representatives = serializers.PrimaryKeyRelatedField(
    queryset= User.objects.all(),
    many=True,
    required=False
    )
    class Meta:
        model = Institution
        fields = '__all__'
        #read_only_fields = ['representatives'] # client should not be able to set representatives directly

    # Create a new institution  using the validated data from the client request
    def create(self, validated_data):
        request = self.context.get('request')
        # Se extrae el campo representatives si se envía en la petición
        extra_representatives = validated_data.pop('representatives', [])
        # Aseguramos que el usuario que hace la petición esté incluido
        representatives = [request.user] + extra_representatives
        institution = Institution.objects.create(**validated_data)
        institution.representatives.set(representatives)
        return institution
    
    def validate(self, data):
        # Here you can also access the request
        request = self.context.get('request')
        user = request.user

        if hasattr(user, 'institutions') and user.institutions.exists():
            raise serializers.ValidationError(
                f"The user {user.username} is already associated with an institution."
            )

        return data
