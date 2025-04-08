from django.urls import path
from .views import RegisterUserView, LoginView, UserProfileView

#define the urls for the authentication system
urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
]