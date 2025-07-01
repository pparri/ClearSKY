# courses/urls.py
from django.urls import path
from . import views
from .views import course_statistics

urlpatterns = [
    # CRUD para Course
    path('', views.list_courses, name='list_courses'),  # GET /courses/
    path('create/', views.create_course, name='create_course'),  # POST /courses/create/
    path('statistics/', course_statistics, name='course-statistics'),
    path('student-courses/', views.student_courses, name='student-courses'),  # ✅ AÑADIR

    path('<str:course_id>/', views.get_course, name='get_course'),  # GET /courses/CS101/
    path('<str:course_id>/update/', views.update_course, name='update_course'),  # PUT
    path('<str:course_id>/delete/', views.delete_course, name='delete_course'),  # DELETE



  
]