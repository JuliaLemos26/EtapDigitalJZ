import logging
from datetime import timedelta
from django.utils import timezone

logger = logging.getLogger(__name__)

def trigger_daily_notifications():
    from home.models import SystemAviso, PlatformSettings
    from publications.models import Tarefa, Concurso, Inscricao

    try:
        settings = PlatformSettings.get_settings()
        hoje = timezone.now().date()
        
        if settings.last_notifications_run == hoje:
            return
            
        agora = timezone.now()
        data_limite_aviso = agora + timedelta(days=3)

        # -----------------------------
        # 1. Verificações das TAREFAS
        # -----------------------------
        for tarefa in Tarefa.objects.filter(end_date__isnull=False):
            # Tarefa Finalizada
            if tarefa.end_date <= agora and not tarefa.notified_finished:
                # Avisar autor principal
                SystemAviso.objects.create(
                    title=f"Tarefa Finalizada: {tarefa.title}",
                    content="O prazo da sua tarefa chegou ao fim.",
                    type='particular',
                    target_user=tarefa.author
                )
                # Avisar autor secundário
                if tarefa.secondary_author:
                     SystemAviso.objects.create(
                        title=f"Tarefa Finalizada: {tarefa.title}",
                        content="O prazo da sua tarefa chegou ao fim.",
                        type='particular',
                        target_user=tarefa.secondary_author
                    )
                # Avisar alunos inscritos (aprovados)
                inscritos = Inscricao.objects.filter(post_type='tarefa', post_id=tarefa.id, status='aprovada')
                for inscr in inscritos:
                    SystemAviso.objects.create(
                        title=f"Tarefa Finalizada: {tarefa.title}",
                        content="A tarefa na qual estavas inscrito(a) foi concluída.",
                        type='particular',
                        target_user=inscr.user
                    )
                tarefa.notified_finished = True
                tarefa.save(update_fields=['notified_finished'])
                continue

            # Prazo Próximo (Tarefa)
            if tarefa.end_date <= data_limite_aviso and not tarefa.notified_approaching_end and not tarefa.notified_finished:
                SystemAviso.objects.create(
                    title=f"Prazo Próximo: {tarefa.title}",
                    content="Atenção! A sua tarefa termina em menos de 3 dias.",
                    type='particular',
                    target_user=tarefa.author
                )
                if tarefa.secondary_author:
                    SystemAviso.objects.create(
                        title=f"Prazo Próximo: {tarefa.title}",
                        content="Atenção! A sua tarefa termina em menos de 3 dias.",
                        type='particular',
                        target_user=tarefa.secondary_author
                    )
                tarefa.notified_approaching_end = True
                tarefa.save(update_fields=['notified_approaching_end'])

        # -----------------------------
        # 2. Verificações dos CONCURSOS
        # -----------------------------
        for concurso in Concurso.objects.filter(end_date__isnull=False):
            # Concurso Finalizado
            if concurso.end_date <= agora and not concurso.notified_finished:
                # Avisar autor principal
                SystemAviso.objects.create(
                    title=f"Concurso Finalizado: {concurso.title}",
                    content="O prazo do seu concurso chegou ao fim.",
                    type='particular',
                    target_user=concurso.author
                )
                # Avisar autor secundário
                if concurso.secondary_author:
                     SystemAviso.objects.create(
                        title=f"Concurso Finalizado: {concurso.title}",
                        content="O prazo do seu concurso chegou ao fim.",
                        type='particular',
                        target_user=concurso.secondary_author
                    )
                # Avisar alunos inscritos (aprovados)
                inscritos = Inscricao.objects.filter(post_type='concurso', post_id=concurso.id, status='aprovada')
                for inscr in inscritos:
                    SystemAviso.objects.create(
                        title=f"Concurso Finalizado: {concurso.title}",
                        content="O concurso no qual estavas inscrito(a) foi concluído.",
                        type='particular',
                        target_user=inscr.user
                    )
                concurso.notified_finished = True
                concurso.save(update_fields=['notified_finished'])
                continue

            # Prazo Próximo (Concurso)
            if concurso.end_date <= data_limite_aviso and not concurso.notified_approaching_end and not concurso.notified_finished:
                SystemAviso.objects.create(
                    title=f"Prazo Próximo: {concurso.title}",
                    content="Atenção! O seu concurso termina em menos de 3 dias.",
                    type='particular',
                    target_user=concurso.author
                )
                if concurso.secondary_author:
                    SystemAviso.objects.create(
                        title=f"Prazo Próximo: {concurso.title}",
                        content="Atenção! O seu concurso termina em menos de 3 dias.",
                        type='particular',
                        target_user=concurso.secondary_author
                    )
                concurso.notified_approaching_end = True
                concurso.save(update_fields=['notified_approaching_end'])

        # Gravar a marcacao de dia concluido
        settings.last_notifications_run = hoje
        settings.save(update_fields=['last_notifications_run'])
        
    except Exception as e:
        logger.error(f"Erro a processar notificacoes diarias: {e}")
