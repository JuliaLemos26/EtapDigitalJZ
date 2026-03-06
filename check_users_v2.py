import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
# pymysql is needed because manage.py has it at the top
import pymysql
pymysql.install_as_MySQLdb()

django.setup()

from django.contrib.auth.models import User
from home.models import Professor, Aluno

def check_users():
    print("--- User Detailed Check ---")
    for user in User.objects.all():
        roles = []
        is_prof = False
        try:
            p = user.professor_profile
            roles.append("Professor")
            is_prof = True
        except Exception:
            pass
            
        try:
            a = user.aluno_profile
            roles.append("Aluno")
        except Exception:
            pass
            
        if user.is_superuser:
            roles.append("Superuser")
            
        print(f"Email: {user.email}")
        print(f"  Roles: {', '.join(roles) if roles else 'None'}")
        print(f"  Groups: {[g.name for g in user.groups.all()]}")
        print("-" * 20)

if __name__ == "__main__":
    check_users()
