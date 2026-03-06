import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
import pymysql
pymysql.install_as_MySQLdb()

import django
django.setup()

from django.template import Template, Context
from django.contrib.auth.models import User

def test_menu_visibility():
    template_path = 'c:/Users/Zafira/Desktop/EtapDigitalPAP/core/templates/index.html'
    with open(template_path, 'r', encoding='utf-8') as f:
        template_content = f.read()
    
    t = Template(template_content)
    
    print("--- Menu Visibility Test ---")
    for user in User.objects.all():
        ctx = Context({'user': user})
        rendered = t.render(ctx)
        has_formpost = 'href="#/formpost"' in rendered
        print(f"User: {user.email}")
        print(f"  Superuser: {user.is_superuser}")
        print(f"  Has Prof Profile: {hasattr(user, 'professor_profile')}")
        print(f"  Can see FormPost: {has_formpost}")
        print("-" * 20)

if __name__ == "__main__":
    test_menu_visibility()
