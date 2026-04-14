import os
import django
from django.test import RequestFactory
from django.template import Template, Context
from django.shortcuts import render

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
import pymysql
pymysql.install_as_MySQLdb()
django.setup()

from django.contrib.auth.models import User
from core.views import admin_dashboard
from publications.views import my_posts

def test_broken_templates():
    factory = RequestFactory()
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        user = User.objects.create_superuser('debug_admin', 'debug@test.com', 'pass')

    print("--- Testing admin_dashboard.html ---")
    try:
        request = factory.get('/admin-dashboard/')
        request.user = user
        response = admin_dashboard(request)
        print("admin_dashboard.html rendered successfully!")
    except Exception as e:
        print(f"Error rendering admin_dashboard.html: {e}")
        import traceback
        traceback.print_exc()

    print("\n--- Testing meus_arquivos.html ---")
    try:
        request = factory.get('/meusarquivos/')
        request.user = user
        response = my_posts(request)
        print("meus_arquivos.html rendered successfully!")
    except Exception as e:
        print(f"Error rendering meus_arquivos.html: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_broken_templates()
