import re
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User, Group
from django.conf import settings
from home.models import Aluno, Professor

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        email = instance.email.lower() 
        
        # Padrão para Aluno: sigla(tgpsi|tag|tmult|tsj|tcab) + 2 dígitos + nome + @etap.pt
        aluno_regex = r'^(tgpsi|tag|tmult|tsj|tcab)(\d{2})(.*)@etap\.pt$'
        match = re.match(aluno_regex, email)
        
        # Verifica se é o Admin Master
        master_admin_email = getattr(settings, 'MASTER_ADMIN_EMAIL', None)
        
        if master_admin_email and email == master_admin_email.lower():
            # Define como Superuser e adiciona ao grupo Administrador
            instance.is_superuser = True
            instance.is_staff = True
            instance.save()
            
            group, _ = Group.objects.get_or_create(name='Administrador')
            instance.groups.add(group)
            
        elif match:
            # É Aluno
            curso = match.group(1)
            ano = match.group(2)
            
            # Cria perfil de Aluno
            Aluno.objects.create(
                user=instance,
                curso=curso,
                ano_inicio=ano
            )
            
            # Adiciona ao grupo Aluno
            group, _ = Group.objects.get_or_create(name='Aluno')
            instance.groups.add(group)
            
        elif email.endswith('@etap.pt'):
            # É Professor (Fallback para qualquer outro @etap.pt)
            Professor.objects.create(user=instance)
            
            # Adiciona ao grupo Professor
            group, _ = Group.objects.get_or_create(name='Professor')
            instance.groups.add(group)
