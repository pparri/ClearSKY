# courses/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # CRUD para Course
    path('', views.list_courses, name='list_courses'),  # GET /courses/
    path('create/', views.create_course, name='create_course'),  # POST /courses/create/
    path('<str:course_id>/', views.get_course, name='get_course'),  # GET /courses/CS101/
    path('<str:course_id>/update/', views.update_course, name='update_course'),  # PUT
    path('<str:course_id>/delete/', views.delete_course, name='delete_course'),  # DELETE
]