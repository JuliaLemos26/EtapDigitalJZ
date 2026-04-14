from django.contrib.auth.models import User
from publications.models import Tarefa, Inscricao
from home.models import SystemAviso
from django.utils import timezone
from datetime import timedelta

print("A iniciar testes de Notificações...")

# 1. Limpar avisos antigos para um ecrã limpo
SystemAviso.objects.all().delete()

# 2. Arranjar um autor principal, um aluno e um professor mock
autor = User.objects.first()
aluno = User.objects.last()

if autor == aluno:
    print("É necessário pelo menos dois utilizadores para testar convenientemente.")
else:
    # 3. Criar uma Tarefa quase no fim
    tarefa = Tarefa.objects.create(
        title="Tarefa Teste Sistema",
        content="Conteúdo",
        author=autor,
        end_date=timezone.now() + timedelta(days=2), # Menos de 3 dias
        notified_approaching_end=False,
        notified_finished=False
    )
    
    print(f"Tarefa criada: {tarefa.title} - Author: {autor}")

    # 4. Criar Inscrição e verificar se chamou criacao
    inscr = Inscricao.objects.create(
        user=aluno,
        post_type='tarefa',
        post_id=tarefa.id,
        titulo="Inscricao de Teste",
        descricao="Desc",
        status='pendente'
    )
    print("Inscricao criada. Avisos para o autor deveriam estar no DB.")
    avisos_autor = SystemAviso.objects.filter(target_user=autor)
    print(f"Avisos autor: {avisos_autor.count()}")

    # 5. Aprovar Inscrição e verificar aluno
    inscr.status = 'aprovada'
    inscr.save(update_fields=['status'] if False else None) # we want proper save() method trigger
    print("Inscricao aprovada.")
    avisos_aluno = SystemAviso.objects.filter(target_user=aluno)
    print(f"Avisos aluno: {avisos_aluno.count()}")

    # 6. Testar trigger daily
    from home.utils_notifications import trigger_daily_notifications
    from home.models import PlatformSettings
    settings = PlatformSettings.get_settings()
    settings.last_notifications_run = None
    settings.save()
    
    trigger_daily_notifications()
    print("Trigger daily executado para avisos temporais.")
    
    avisos_finais_autor = SystemAviso.objects.filter(target_user=autor).count()
    print(f"Total avisos autor após timer: {avisos_finais_autor}")
    
    # Clean up test
    tarefa.delete()
    inscr.delete()
    
print("Testes concluídos.")
