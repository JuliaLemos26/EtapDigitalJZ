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

    @property
    def pontos(self):
        from publications.models import Inscricao, Concurso, Tarefa
        from django.utils import timezone
        
        pontos_total = 0
        
        # 1. Tarefas aprovadas e concluidas (100 pontos cada)
        tarefas_aprovadas_ids = Inscricao.objects.filter(user=self.user, post_type='tarefa', status='aprovada').values_list('post_id', flat=True)
        tarefas_concluidas = Tarefa.objects.filter(id__in=tarefas_aprovadas_ids, end_date__lte=timezone.now()).count()
        pontos_total += tarefas_concluidas * 100
        
        # 2. Concursos
        inscricoes_concurso_ids = list(Inscricao.objects.filter(user=self.user, post_type='concurso').values_list('post_id', flat=True))
        
        if inscricoes_concurso_ids:
            concursos = Concurso.objects.filter(id__in=inscricoes_concurso_ids)
            for concurso in concursos:
                if concurso.winner_1 == self.user:
                    pontos_total += 500
                elif concurso.winner_2 == self.user:
                    pontos_total += 400
                elif concurso.winner_3 == self.user:
                    pontos_total += 300
                else:
                    pontos_total += 150
                    
        return pontos_total

class Professor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='professor_profile')

    def __str__(self):
        return f"Professor: {self.user.username}"
