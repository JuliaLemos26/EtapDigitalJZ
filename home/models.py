from django.db import models
from django.contrib.auth.models import User
import re
from django.utils import timezone


YEAR_CHOICES = [
    ('22', 'Matrícula em 2022'),
    ('23', 'Matrícula em 2023'),
    ('24', 'Matrícula em 2024'),
    ('25', 'Matrícula em 2025'),
    ('26', 'Matrícula em 2026'),
]

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
    ano_inicio = models.CharField(max_length=2, choices=YEAR_CHOICES, verbose_name="Ano de Matrícula")
    patinho_nome = models.CharField(max_length=50, blank=True, null=True, verbose_name="Nome do Patinho")
    pontos_gastos = models.PositiveIntegerField(default=0, verbose_name="Pontos Gastos")

    @property
    def ano_escolar_label(self):
        """Calcula se é 10º, 11º ou 12º ano baseado no email ou ano_inicio."""
        year_str = self.ano_inicio
        # Tenta extrair do email se o campo estiver vazio ou não numérico
        if not year_str or not year_str.isdigit():
            match = re.search(r'\d{2}', self.user.email)
            if match:
                year_str = match.group(0)
            else:
                return "Ano N/D"

        try:
            enrollment_year = int(year_str)
            now = timezone.now()
            # O ano letivo começa em Setembro (mês 9)
            # Se estamos em Abril 2026, o início do ano letivo foi 2025
            current_school_year_start = now.year if now.month >= 9 else now.year - 1
            current_school_year_short = current_school_year_start % 100
            
            # 23 -> 25 - 23 + 10 = 12
            year_num = (current_school_year_short - enrollment_year) + 10
            
            if year_num < 10: return "Pré-10º"
            if year_num > 12: return "Graduado"
            return f"{year_num}º Ano"
        except (ValueError, TypeError):
            return "Erro no Cálculo"

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

    @property
    def pontos_disponiveis(self):
        return max(0, self.pontos - self.pontos_gastos)

class Professor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='professor_profile')

    def __str__(self):
        return f"Professor: {self.user.username}"


class PlatformSettings(models.Model):
    is_suspended = models.BooleanField(default=False)
    last_notifications_run = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Manutenção: {'Ativada' if self.is_suspended else 'Desativada'}"

    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(id=1)
        return obj


class HomeBanner(models.Model):
    title = models.CharField(max_length=100, blank=True, null=True)
    file = models.FileField(upload_to='banners/')
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title or f"Banner {self.id}"


class SystemAviso(models.Model):
    TYPE_CHOICES = [
        ('geral', 'Geral'),
        ('filtrado', 'Filtrado'),
        ('particular', 'Particular'),
    ]
    title = models.CharField(max_length=200)
    content = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # Filters
    target_course = models.CharField(max_length=50, blank=True, null=True)
    target_year = models.CharField(max_length=10, blank=True, null=True)
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='directed_avisos')

    expiration_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class AvatarPart(models.Model):
    is_base = models.BooleanField(default=False)
    image = models.FileField(upload_to='avatar/parts/')
    z_index = models.IntegerField(default=0)
    pos_x = models.IntegerField(default=0)
    pos_y = models.IntegerField(default=0)
    scale = models.FloatField(default=1.0)
    label = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ['z_index']

    def __str__(self):
        return f"{self.label or 'Parte'} (Z: {self.z_index})"


class Outfit(models.Model):
    name = models.CharField(max_length=200)
    price = models.PositiveIntegerField(default=0)
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_outfits')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_outfits')
    preview_image = models.ImageField(upload_to='outfits/previews/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class OutfitPart(models.Model):
    outfit = models.ForeignKey(Outfit, on_delete=models.CASCADE, related_name='parts')
    image = models.FileField(upload_to='outfits/parts/')
    z_index = models.IntegerField(default=0)
    pos_x = models.IntegerField(default=0)
    pos_y = models.IntegerField(default=0)

    class Meta:
        ordering = ['z_index']


class OutfitPurchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='outfit_purchases')
    outfit = models.ForeignKey(Outfit, on_delete=models.CASCADE)
    purchased_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'outfit')


class UserAvatarState(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='avatar_state')
    active_outfit = models.ForeignKey(Outfit, on_delete=models.SET_NULL, null=True, blank=True)
    active_emotion = models.CharField(max_length=50, default='normal')

    def __str__(self):
        return f"Avatar de {self.user.username}"
