from django.urls import path
from . import views
from .views import GradeExcelUploadView, CourseGradeStatisticsView

urlpatterns = [
    path('grades/', views.GradeAssignmentListCreateView.as_view(), name='grade-list-create'),
    path('grades/<int:pk>/', views.GradeAssignmentDetailView.as_view(), name='grade-detail'),
    path('grades/<int:pk>/finalize/', views.finalize_grade, name='grade-finalize'),
    path('grades/<int:pk>/request-review/', views.request_review, name='grade-request-review'),

    path('reviews/', views.ReviewRequestListView.as_view(), name='review-list'),
    path('reviews/<int:pk>/', views.ReviewRequestDetailView.as_view(), name='review-detail'),
    path('reviews/<int:pk>/respond/', views.respond_to_review, name='review-respond'),

    path('upload-excel/', GradeExcelUploadView.as_view(), name='grade-upload-excel'),
    path('courses/<int:course_pk>/semester/<str:semester_name>/statistics/', CourseGradeStatisticsView.as_view(), name='course_grade_statistics'),


]
