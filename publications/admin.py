from django.contrib import admin
from .models import Tarefa, Concurso, Projeto, Evento

class BasePublicationAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at')
    list_filter = ('created_at', 'author')
    search_fields = ('title', 'content')
    date_hierarchy = 'created_at'

@admin.register(Tarefa)
class TarefaAdmin(BasePublicationAdmin):
    list_display = BasePublicationAdmin.list_display + ('participant_limit', 'needs_approval')
    list_filter = BasePublicationAdmin.list_filter + ('needs_approval',)

@admin.register(Concurso)
class ConcursoAdmin(BasePublicationAdmin):
    list_display = BasePublicationAdmin.list_display + ('allow_files',)

@admin.register(Projeto)
class ProjetoAdmin(BasePublicationAdmin):
    pass

@admin.register(Evento)
class EventoAdmin(BasePublicationAdmin):
    list_display = BasePublicationAdmin.list_display + ('event_date', 'expiration_date')
