from django.db import models
from django.contrib.auth.models import User
from wagtail.snippets.models import register_snippet

class BasePublication(models.Model):
    title = models.CharField(max_length=255, verbose_name="Título")
    content = models.TextField(verbose_name="Conteúdo")
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Autor")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    image = models.ImageField(upload_to='publications/', null=True, blank=True, verbose_name="Imagem de Destaque")

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def __str__(self):
        return self.title

@register_snippet
class Tarefa(BasePublication):
    start_date = models.DateTimeField(verbose_name="Data de Início")
    end_date = models.DateTimeField(verbose_name="Data de Conclusão")
    participant_limit = models.PositiveIntegerField(verbose_name="Limite de Participantes")
    needs_approval = models.BooleanField(default=True, verbose_name="Requer Aprovação de Inscrição")

    class Meta:
        verbose_name = "Tarefa"
        verbose_name_plural = "Tarefas"

@register_snippet
class Concurso(BasePublication):
    start_date = models.DateTimeField(verbose_name="Data de Início")
    end_date = models.DateTimeField(verbose_name="Data de Conclusão")
    allow_files = models.BooleanField(default=True, verbose_name="Permitir Coleta de Arquivos")

    class Meta:
        verbose_name = "Concurso"
        verbose_name_plural = "Concursos"

@register_snippet
class Projeto(BasePublication):
    # Projetos não têm campos extras além da data de publicação (created_at)
    class Meta:
        verbose_name = "Projeto"
        verbose_name_plural = "Projetos"

@register_snippet
class Evento(BasePublication):
    event_date = models.DateTimeField(verbose_name="Data de Realização")
    link = models.URLField(max_length=500, null=True, blank=True, verbose_name="Link Externo")
    expiration_date = models.DateTimeField(verbose_name="Data para Exclusão do Arquivo")

    class Meta:
        verbose_name = "Evento"
        verbose_name_plural = "Eventos"
