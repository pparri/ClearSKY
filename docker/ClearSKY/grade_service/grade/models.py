from django.db import models
from django.contrib.auth import get_user_model
from course.models import Course

User = get_user_model()

class GradeAssignment(models.Model):
    class GradeState(models.TextChoices):
        VOID = 'VOID'
        OPEN = 'OPEN'
        FINAL = 'FINAL'

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='grades')
    #instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_grades')  # NUEVO
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_grades', null=True, blank=True)

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='grades')
    grade_value = models.FloatField(null=True, blank=True)
    state = models.CharField(max_length=10, choices=GradeState.choices, default=GradeState.VOID)
    timestamp = models.DateTimeField(auto_now_add=True)
    semester = models.CharField(max_length=20)

    class Meta:
        unique_together = ('student', 'course', 'semester') #solo puede existir un unico regstro de un estudiante por curso y semestre

    
#clase para guardar el numero de pregunta y el valor
class QuestionGrade(models.Model):
    grade_assignment = models.ForeignKey(GradeAssignment, on_delete=models.CASCADE, related_name='question_grades')
    question_number = models.CharField(max_length=10)  # 'Q01', 'Q02', etc.
    value = models.FloatField()


class ReviewRequest(models.Model):
    grade_assignment = models.ForeignKey(GradeAssignment, on_delete=models.CASCADE, related_name='review_requests')
    reason = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    response = models.TextField(null=True, blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    responded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='review_responses')  # NUEVO

