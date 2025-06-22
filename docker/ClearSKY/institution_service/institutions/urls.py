from django.urls import path
from .views import InstitutionCreateView, InstitutionListView, InstitutionDeleteView, InstitutionHardDeleteView,UpdateRepresentativesView


urlpatterns = [
    path('', InstitutionListView.as_view(), name='institution-list'),
    path('create/', InstitutionCreateView.as_view(), name='institution-create'),
    path('<int:pk>/delete/', InstitutionDeleteView.as_view(), name='institution-delete'),
    path('<int:pk>/hard-delete/', InstitutionHardDeleteView.as_view(), name='institution-hard-delete'),
    path('<int:pk>/update-representatives/', UpdateRepresentativesView.as_view(), name='institution-update-representatives'),
]
