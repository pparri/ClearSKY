from django.shortcuts import render

# Create your views here.

from rest_framework import generics, permissions
from .models import GradeAssignment
from .serializers import GradeAssignmentSerializer

class GradeAssignmentListCreateView(generics.ListCreateAPIView):
    queryset = GradeAssignment.objects.all()
    serializer_class = GradeAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student': #if u are a student u can only see your grades
            return GradeAssignment.objects.filter(student=user)
        elif user.role == 'instructor': # if u are an instructor u can see the grades of your courses
            return GradeAssignment.objects.filter(course__instructor=user)
        return GradeAssignment.objects.none()
    


    

