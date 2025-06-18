# course/models.py
from django.db import models
from django.contrib.auth import get_user_model
from institutions.models import Institution  # o la ruta real donde tengas tu clase Institution

User = get_user_model()

class Course(models.Model):
    code = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    email = models.EmailField()
    #password = models.CharField(max_length=128)

    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name="courses")
    instructors = models.ManyToManyField(User, related_name="courses")

    def __str__(self):
        return f"{self.title} ({self.code})"

