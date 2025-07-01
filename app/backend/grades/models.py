from django.db import models
from django.contrib.auth import get_user_model
from course.models import Course

User = get_user_model()

class GradeAssignment(models.Model):
    class GradeState(models.TextChoices):
        VOID = 'VOID'
        OPEN = 'OPEN'
        FINAL = 'FINAL'

    SUBMISSION_TYPE_CHOICES = [
        ('initial', 'Initial'),
        ('final', 'Final'),
    ]
    submission_type = models.CharField(max_length=10, choices=SUBMISSION_TYPE_CHOICES, default='initial') 
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='grades')
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_grades', null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='grades')
    grade_value = models.FloatField(null=True, blank=True)
    state = models.CharField(max_length=10, choices=GradeState.choices, default=GradeState.VOID)
    timestamp = models.DateTimeField(auto_now_add=True)

    semester = models.CharField(max_length=20)

    class Meta:
        unique_together = ('student', 'course', 'semester', 'submission_type') 
    
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

    class Meta:
            # ✅ AÑADIR CONSTRAINT: Solo una review por estudiante por curso
            #unique_together = ('grade_assignment__student', 'grade_assignment__course')
        pass
        
    def save(self, *args, **kwargs):
    # ✅ VALIDACIÓN ADICIONAL: Verificar que no existe otra review del mismo estudiante para el mismo curso
        if not self.pk:  # Solo en creación, no en actualización
            existing_review = ReviewRequest.objects.filter(
                grade_assignment__student=self.grade_assignment.student,
                grade_assignment__course=self.grade_assignment.course
            ).first()
            
            if existing_review:
                raise ValueError(f"El estudiante ya tiene una review request para el curso {self.grade_assignment.course.title}")
        
        super().save(*args, **kwargs)