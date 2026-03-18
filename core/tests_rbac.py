from django.test import TestCase
from django.contrib.auth.models import User, Group
from home.models import Aluno, Professor
from django.conf import settings

class RBACTestCase(TestCase):
    def setUp(self):
        Group.objects.get_or_create(name='Aluno')
        Group.objects.get_or_create(name='Professor')
        Group.objects.get_or_create(name='Administrador')

    def test_aluno_assignment(self):
        email = "tgpsi00aluno@etap.pt"
        user = User.objects.create_user(username="aluno_teste", email=email, password="password123")
        
        self.assertTrue(Aluno.objects.filter(user=user).exists())
        aluno = Aluno.objects.get(user=user)
        self.assertEqual(aluno.curso, "tgpsi")
        self.assertEqual(aluno.ano_inicio, "00")
       
        self.assertTrue(user.groups.filter(name='Aluno').exists())

    def test_professor_assignment(self):
        email = "professor_teste@etap.pt"
        user = User.objects.create_user(username="professor_teste", email=email, password="password123")
        
        self.assertTrue(Professor.objects.filter(user=user).exists())
        
        self.assertTrue(user.groups.filter(name='Professor').exists())

    def test_master_admin_assignment(self):
        
        master_email = getattr(settings, 'MASTER_ADMIN_EMAIL', 'ADMIN@etap.pt')
        user = User.objects.create_user(username="admin_teste", email=master_email, password="password123")
        
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        
        self.assertTrue(user.groups.filter(name='Administrador').exists())

    def test_invalid_email_no_profile(self):
        # Outros emails não devem ser processados
        email = "externo@gmail.com"
        user = User.objects.create_user(username="externo", email=email, password="password123")
        
        # Não deve criar perfis nem adicionar a grupos
        self.assertFalse(Aluno.objects.filter(user=user).exists())
        self.assertFalse(Professor.objects.filter(user=user).exists())
        self.assertEqual(user.groups.count(), 0)
