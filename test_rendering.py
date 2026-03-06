import os
import django
from django.test import RequestFactory

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
import pymysql
pymysql.install_as_MySQLdb()
django.setup()

from django.contrib.auth.models import User
from core.views import spa_page

def test_spa_page_rendering():
    factory = RequestFactory()
    
    print("--- SPA Page Rendering Test (formpost) ---")
    for user in User.objects.all():
        request = factory.get('/pages/formpost/')
        request.user = user
        
        response = spa_page(request, 'formpost')
        # Check based on content
        content = response.content.decode('utf-8')
        is_home = 'Tarefas Recentes' in content
        is_formpost = 'Área de Publicação' in content
        
        page_shown = "HOME" if is_home else ("FORMPOST" if is_formpost else "UNKNOWN")
        
        print(f"User: {user.email}")
        print(f"  Super: {user.is_superuser}")
        print(f"  Prof: {hasattr(user, 'professor_profile')}")
        print(f"  Result: {page_shown}")
        print("-" * 20)

if __name__ == "__main__":
    test_spa_page_rendering()
