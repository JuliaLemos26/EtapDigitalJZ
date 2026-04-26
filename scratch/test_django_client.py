import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model

User = get_user_model()

def test_fetch():
    # Find any existing active user to log in as
    user = User.objects.filter(is_active=True).first()
    if not user:
        print("No active users found.")
        return

    print(f"Testing with user: {user.username}")
    
    client = Client()
    client.force_login(user)
    
    # Simulate fetch to /pages/home/
    response = client.get('/pages/home/')
    
    print(f"Status Code: {response.status_code}")
    if response.status_code in (301, 302):
        print(f"Redirect URL: {response.url}")
    
    content = response.content.decode('utf-8')
    print(f"Content Length: {len(content)}")
    if 'Login' in content or 'Registe-se' in content:
        print("Response contains Login page!")
    else:
        print("Response contains actual content.")
        print("Preview:")
        print(content[:500])

if __name__ == '__main__':
    test_fetch()
