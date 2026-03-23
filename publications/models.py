from django.db import models
from django.contrib.auth.models import User
from wagtail.snippets.models import register_snippet

class BasePublication(models.Model):
    title = models.CharField(max_length=255, verbose_name="Título")
    content = models.TextField(verbose_name="Conteúdo")
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Autor")
    secondary_author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='%(class)s_secondary', verbose_name="Autor Secundário (Aluno)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    image = models.ImageField(upload_to='publications/images/', null=True, blank=True, verbose_name="Imagem de Destaque")

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def __str__(self):
        return self.title

@register_snippet
class Tarefa(BasePublication):
    COURSES = [
        ('GPSI', 'Gestão e Programação de Sistemas Informáticos'),
        ('MULT', 'Multimédia'),
        ('AG', 'Artes Gráficas'),
        ('SJ', 'Serviços Jurídicos'),
        ('CAB', 'Cabeleireiro'),
        ('nenhum', 'Nenhum (Todos os cursos)'),
    ]
    YEAR_CHOICES = [
        ('10', '10º Ano'),
        ('11', '11º Ano'),
        ('12', '12º Ano'),
        ('todos', 'Todos os Anos'),
    ]
    course = models.CharField(max_length=50, choices=COURSES, default='nenhum', verbose_name="Curso")
    school_year = models.CharField(max_length=10, choices=YEAR_CHOICES, default='todos', verbose_name="Ano Escolar")
    start_date = models.DateTimeField(auto_now_add=True, null=True, blank=True, verbose_name="Data de Início")
    end_date = models.DateTimeField(null=True, blank=True, verbose_name="Data de Conclusão")
    participant_limit = models.PositiveIntegerField(null=True, blank=True, verbose_name="Limite de Participantes")
    needs_approval = models.BooleanField(default=True, verbose_name="Requer Aprovação de Inscrição")

    class Meta:
        verbose_name = "Tarefa"
        verbose_name_plural = "Tarefas"

@register_snippet
class Concurso(BasePublication):
    COURSES = [
        ('GPSI', 'Gestão e Programação de Sistemas Informáticos'),
        ('MULT', 'Multimédia'),
        ('AG', 'Artes Gráficas'),
        ('SJ', 'Jurídicos'),
        ('CAB', 'Cabeleireiro'),
        ('nenhum', 'Nenhum (Todos os cursos)'),
    ]
    YEAR_CHOICES = [
        ('10', '10º Ano'),
        ('11', '11º Ano'),
        ('12', '12º Ano'),
        ('todos', 'Todos os Anos'),
    ]
    course = models.CharField(max_length=50, choices=COURSES, default='nenhum', verbose_name="Curso")
    school_year = models.CharField(max_length=10, choices=YEAR_CHOICES, default='todos', verbose_name="Ano Escolar")
    start_date = models.DateTimeField(auto_now_add=True, null=True, blank=True, verbose_name="Data de Início")
    end_date = models.DateTimeField(null=True, blank=True, verbose_name="Data de Conclusão")
    document = models.FileField(upload_to='publications/documents/', null=True, blank=True, verbose_name="Documento/Edital")
    allow_files = models.BooleanField(default=True, verbose_name="Permitir Coleta de Arquivos")

    class Meta:
        verbose_name = "Concurso"
        verbose_name_plural = "Concursos"

@register_snippet
class Projeto(BasePublication):
    COURSES = [
        ('GPSI', 'Gestão e Programação de Sistemas Informáticos'),
        ('MULT', 'Multimédia'),
        ('AG', 'Artes Gráficas'),
        ('SJ', 'Jurídicos'),
        ('CAB', 'Cabeleireiro'),
        ('nenhum', 'Nenhum (Todos os cursos)'),
    ]
    YEAR_CHOICES = [
        ('10', '10º Ano'),
        ('11', '11º Ano'),
        ('12', '12º Ano'),
        ('todos', 'Todos os Anos'),
    ]
    course = models.CharField(max_length=50, choices=COURSES, default='nenhum', verbose_name="Curso")
    school_year = models.CharField(max_length=10, choices=YEAR_CHOICES, default='todos', verbose_name="Ano Escolar")
    publication_date = models.DateTimeField(auto_now_add=True, null=True, blank=True, verbose_name="Data de Publicação")
    document = models.FileField(upload_to='publications/documents/', null=True, blank=True, verbose_name="Documento do Projeto")
    
    class Meta:
        verbose_name = "Projeto"
        verbose_name_plural = "Projetos"

@register_snippet
class Evento(BasePublication):
    publication_date = models.DateTimeField(auto_now_add=True, null=True, blank=True, verbose_name="Data de Publicação")
    expiration_date = models.DateTimeField(null=True, blank=True, verbose_name="Data para Exclusão do Arquivo")
    link = models.URLField(max_length=500, null=True, blank=True, verbose_name="Link Externo")

    class Meta:
        verbose_name = "Evento"
        verbose_name_plural = "Eventos"

class Inscricao(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Usuário")
    post_type = models.CharField(max_length=20, choices=[('tarefa', 'Tarefa'), ('concurso', 'Concurso')], verbose_name="Tipo de Post")
    post_id = models.PositiveIntegerField(verbose_name="ID do Post")
    titulo = models.CharField(max_length=255, verbose_name="Título da Inscrição")
    descricao = models.TextField(verbose_name="Descrição da Inscrição")
    arquivo = models.FileField(upload_to='inscriptions/files/', null=True, blank=True, verbose_name="Arquivo da Inscrição")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Inscrição")

    class Meta:
        verbose_name = "Inscrição"
        verbose_name_plural = "Inscrições"
        unique_together = ('user', 'post_type', 'post_id')

    def __str__(self):
        return f"{self.titulo} - {self.user.username}"
