from django.contrib import admin
from .models import Tarefa, Concurso, Projeto, Evento

class BasePublicationAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at')
    list_filter = ('created_at', 'author')
    search_fields = ('title', 'content')
    date_hierarchy = 'created_at'

@admin.register(Tarefa)
class TarefaAdmin(BasePublicationAdmin):
    list_display = BasePublicationAdmin.list_display + ('course', 'school_year', 'participant_limit', 'needs_approval')
    list_filter = BasePublicationAdmin.list_filter + ('course', 'school_year', 'needs_approval')

@admin.register(Concurso)
class ConcursoAdmin(BasePublicationAdmin):
    list_display = BasePublicationAdmin.list_display + ('course', 'school_year', 'allow_files')
    list_filter = BasePublicationAdmin.list_filter + ('course', 'school_year')

@admin.register(Projeto)
class ProjetoAdmin(BasePublicationAdmin):
    list_display = BasePublicationAdmin.list_display + ('course', 'school_year', 'publication_date', 'document')
    list_filter = BasePublicationAdmin.list_filter + ('course', 'school_year')

@admin.register(Evento)
class EventoAdmin(BasePublicationAdmin):
    list_display = BasePublicationAdmin.list_display + ('publication_date', 'expiration_date')
