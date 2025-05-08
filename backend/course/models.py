# course/models.py
from django.db import models
from django.contrib.auth import get_user_model
from institutions.models import Institution  # o la ruta real donde tengas tu clase Institution

User = get_user_model()

class Course(models.Model):
    course_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    email = models.EmailField()
    password = models.CharField(max_length=128)

    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name="courses")
    instructors = models.ManyToManyField(User, related_name="courses")

    def __str__(self):
        return f"{self.title} ({self.course_id})"


from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ReviewRequest(models.Model):
    #grade = models.ForeignKey('GradeAssignment', on_delete=models.CASCADE, related_name='review_requests')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_requests')
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=[('PENDING', 'PENDING'), ('ACCEPTED', 'ACCEPTED'), ('REJECTED', 'REJECTED')], default='PENDING')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} → {self.grade} ({self.status})"