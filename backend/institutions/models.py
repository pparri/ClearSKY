from django.db import models

# Create your models here.


from django.conf import settings

class Institution(models.Model):
    name = models.CharField(max_length=255, unique=True)
    email = models.EmailField()
    is_active = models.BooleanField(default=True)
    representatives = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='institutions',
        limit_choices_to={'role': 'representative'}
    )

    def __str__(self):
        return self.name
    
#soft delete: you don't broke relations between models and you don't delete the data from the database (recommended when is important data)
    def delete(self):
        self.is_active = False
        self.save()
        
    def hard_delete(self):
        super(Institution, self).delete()