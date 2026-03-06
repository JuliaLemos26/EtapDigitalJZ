from django.test import TestCase
from django.contrib.auth.models import User, Group
from home.models import Aluno, Professor
from django.conf import settings

class RBACTestCase(TestCase):
    def setUp(self):
        # Garante que os grupos existem
        Group.objects.get_or_create(name='Aluno')
        Group.objects.get_or_create(name='Professor')
        Group.objects.get_or_create(name='Administrador')

    def test_aluno_assignment(self):
        # Usando um exemplo genérico seguindo o padrão: sigla + 00 + nome + @etap.pt
        email = "tgpsi00aluno@etap.pt"
        user = User.objects.create_user(username="aluno_teste", email=email, password="password123")
        
        # Verifica se perfil Aluno foi criado
        self.assertTrue(Aluno.objects.filter(user=user).exists())
        aluno = Aluno.objects.get(user=user)
        self.assertEqual(aluno.curso, "tgpsi")
        self.assertEqual(aluno.ano_inicio, "00")
        
        # Verifica se está no grupo Aluno
        self.assertTrue(user.groups.filter(name='Aluno').exists())

    def test_professor_assignment(self):
        # Professor é definido por não possuir sigla+numero e terminar em @etap.pt
        email = "professor_teste@etap.pt"
        user = User.objects.create_user(username="professor_teste", email=email, password="password123")
        
        # Verifica se perfil Professor foi criado
        self.assertTrue(Professor.objects.filter(user=user).exists())
        
        # Verifica se está no grupo Professor
        self.assertTrue(user.groups.filter(name='Professor').exists())

    def test_master_admin_assignment(self):
        # O Admin Master é definido pelo email exato no settings
        master_email = getattr(settings, 'MASTER_ADMIN_EMAIL', 'SEU_EMAIL_ADMIN@etap.pt')
        user = User.objects.create_user(username="admin_teste", email=master_email, password="password123")
        
        # Verifica privilégios
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        
        # Verifica se está no grupo Administrador
        self.assertTrue(user.groups.filter(name='Administrador').exists())

    def test_invalid_email_no_profile(self):
        # Outros emails não devem ser processados
        email = "externo@gmail.com"
        user = User.objects.create_user(username="externo", email=email, password="password123")
        
        # Não deve criar perfis nem adicionar a grupos
        self.assertFalse(Aluno.objects.filter(user=user).exists())
        self.assertFalse(Professor.objects.filter(user=user).exists())
        self.assertEqual(user.groups.count(), 0)
