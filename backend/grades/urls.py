from django.urls import path
from .views import GradeAssignmentListCreateView

urlpatterns = [
    path('', GradeAssignmentListCreateView.as_view(), name='grade-list-create'),
]
