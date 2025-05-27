from django.urls import path
from . import views
from .views import GradeExcelUploadView, CourseGradeStatisticsView

urlpatterns = [
    path('grades/', views.GradeAssignmentListCreateView.as_view(), name='grade-list-create'),
    path('grades/<int:pk>/', views.GradeAssignmentDetailView.as_view(), name='grade-detail'),
    path('grades/<int:pk>/update-state/', views.UpdateGradeStateView.as_view(), name='grade-update-state'),


    path('grades/<int:pk>/request-review/', views.RequestReviewView.as_view(), name='grade-request-review'),
    path('reviews/', views.ReviewRequestListView.as_view(), name='review-list'),
    path('reviews/<int:pk>/', views.ReviewRequestDetailView.as_view(), name='review-detail'), #necesario??
    path('reviews/<int:pk>/respond/', views.RespondToReviewView.as_view(), name='review-respond'),

    path('upload-excel/', GradeExcelUploadView.as_view(), name='grade-upload-excel'),
    path('courses/<int:course_pk>/semester/statistics/<str:semester_name>/', views.CourseGradeStatisticsView.as_view(), name='course-grade-statistics'),


]
