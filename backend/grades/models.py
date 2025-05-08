

from django.db import models
from django.conf import settings
from course.models import Course  # O 'course.models' si tu app se llama así

class GradeAssignment(models.Model):
    STATE_CHOICES = [
        ('VOID', 'Void'),
        ('OPEN', 'Open'),
        ('FINAL', 'Final'),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='grades',
        limit_choices_to={'role': 'student'}
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='grades'
    )
    grade_value = models.FloatField()
    state = models.CharField(max_length=10, choices=STATE_CHOICES)
    semester = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.username} - {self.course.title}: {self.grade_value}"
    
class ExcelFile(models.Model):
    course = models.ForeignKey('course.Course', on_delete=models.CASCADE, related_name='excel_files')
    file = models.FileField(upload_to='grades/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_final = models.BooleanField(default=False)

