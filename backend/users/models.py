from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    #define the possible roles for a user
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('representative', 'Institution Representative'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username} ({self.role})"
