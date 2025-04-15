from django.db import models

# Create your models here.


from django.conf import settings

class Institution(models.Model):
    name = models.CharField(max_length=255, unique=True)
    email = models.EmailField()
    representative = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='institution',
        limit_choices_to={'role': 'representative'}
    )

    def __str__(self):
        return self.name