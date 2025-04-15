from django.urls import path
from .views import InstitutionCreateView, InstitutionListView

urlpatterns = [
    path('', InstitutionListView.as_view(), name='institution-list'),
    path('create/', InstitutionCreateView.as_view(), name='institution-create'),
]
