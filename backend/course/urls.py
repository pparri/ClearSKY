# course/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_course, name='create_course'),  # POST /courses/
    path('<int:course_id>/', views.get_course, name='get_course'),  # GET /courses/:id
    path('<int:course_id>/upload-initial-grades/', views.upload_initial_grades, name='upload_initial_grades'),
    path('<int:course_id>/request-review/', views.request_review, name='request_review'),
    path('<int:course_id>/respond-review/', views.respond_review, name='respond_review'),
    path('<int:course_id>/finalize-grades/', views.finalize_grades, name='finalize_grades'),
    path('<int:course_id>/statistics/', views.get_statistics, name='get_statistics'),
]
