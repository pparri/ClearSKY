
# Create your views here.


from .models import Institution
from .serializers import InstitutionSerializer
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

User = get_user_model()

# Custom permission to allow only representatives to create institutions
class IsRepresentative(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'representative'

class InstitutionCreateView(generics.CreateAPIView):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [IsRepresentative]

class InstitutionListView(generics.ListAPIView):
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAuthenticated]
    # Ensure that only active institutions are listed
    def get_queryset(self):
        return Institution.objects.filter(is_active=True)
    
#We need the class to assure that the representative of the institution is the owner
class IsInstitutionOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user in obj.representatives.all()

#soft delete
class InstitutionDeleteView(generics.DestroyAPIView):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAuthenticated, IsRepresentative, IsInstitutionOwner]

    def destroy(self, request, *args, **kwargs):
        institution = self.get_object()
        institution.delete() 
        return Response(
            {"detail": "Institution successfully soft-deleted."},
            status=status.HTTP_204_NO_CONTENT
        )
    
class InstitutionHardDeleteView(generics.DestroyAPIView):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAuthenticated, IsRepresentative, IsInstitutionOwner]

    def destroy(self, request, *args, **kwargs):
        institution = self.get_object()
        institution.hard_delete()
        return Response(
            {"detail": "Institution permanently deleted."},
            status=status.HTTP_204_NO_CONTENT
        )
    


class UpdateRepresentativesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        institution = get_object_or_404(Institution, pk=pk) # Get the institution by primary key

        # Only current representatives can modify
        if request.user not in institution.representatives.all():
            return Response({"detail": "You do not have permission to modify this institution."}, status=403)

        action = request.data.get("action")
        user_ids = request.data.get("user_ids", [])

        # Validate the action and user_ids
        if not isinstance(user_ids, list) or action not in ["add", "remove"]:
            return Response({"detail": "Incorrect format."}, status=400)

        try:
            user_ids = list(map(int, user_ids))
        except ValueError:
            return Response({"detail": "The IDs are not integers."}, status=400)

        users = User.objects.filter(id__in=user_ids)


        invalid_role_users = [u.username for u in users if u.role != 'representative']
        if invalid_role_users:
            return Response({
                "detail": f"The next users are not representatives': {', '.join(invalid_role_users)}"
            }, status=400)

        if action == "add":
            already_representatives = institution.representatives.filter(id__in=user_ids)
            if already_representatives.exists():
                names = [u.username for u in already_representatives]
                return Response({
                    "detail": f"These users are already representatives: {', '.join(names)}"
                }, status=400)
            institution.representatives.add(*users)
            msg = "Representatives added successfully."
        elif action == "remove":
            user_ids = request.data.get("user_ids", [])
            if request.user.id in user_ids:
                return Response({
                    "detail": "You cannot remove yourself."
                }, status=400)
            institution.representatives.remove(*users)

        return Response({
            "detail": f"Representatives updated successfully.",
            "current_representatives": [u.id for u in institution.representatives.all()]
        }, status=200)

