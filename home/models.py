from django.db import models
from django.contrib.auth.models import User

class Aluno(models.Model):
    CURSO_CHOICES = [
        ('tgpsi', 'TGPSI'),
        ('tag', 'TAG'),
        ('tmult', 'TMULT'),
        ('tsj', 'TSJ'),
        ('tcab', 'TCAB'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='aluno_profile')
    curso = models.CharField(max_length=10, choices=CURSO_CHOICES)
    ano_inicio = models.CharField(max_length=2)

    def __str__(self):
        return f"Aluno: {self.user.username} ({self.get_curso_display()})"

class Professor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='professor_profile')

    def __str__(self):
        return f"Professor: {self.user.username}"
