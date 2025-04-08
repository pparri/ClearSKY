from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # (username, email, password)
    id = models.CharField(max_length=10, primary_key=True)  # Ej: "031xxxxxxx" (user identifier)
    role = models.CharField(max_length=20, choices=[('STUDENT', 'Student'), ('INSTRUCTOR', 'Instructor'), ('ADMIN', 'Admin')])
    #distinguishes between user types

class Institution(models.Model):
    id = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100)
    credits = models.IntegerField(default=0)

class Course(models.Model):
    id = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100)
    exam_period = models.CharField(max_length=50)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE)

class Grade(models.Model):
    class Status(models.TextChoices):  # Equivalente al enum GradeStatus
        VOID = 'VOID', 'Void'   #initial state (no grades)
        OPEN = 'OPEN', 'Open'   # grades uploaded, editable
        FINAL = 'FINAL', 'Final'   # grades finalized
    
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE) #links grades to students and courses
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    value = models.FloatField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.VOID)