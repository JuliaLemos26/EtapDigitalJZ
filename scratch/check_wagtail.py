import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
django.setup()

from wagtail.models import Site
from wagtail.contrib.redirects.models import Redirect

print("=== WAGTAIL SITES ===")
for site in Site.objects.all():
    print(f"ID: {site.id}, Hostname: {site.hostname}, Port: {site.port}, Root Page: {site.root_page.url_path if site.root_page else 'None'}")

print("\n=== WAGTAIL REDIRECTS ===")
for redirect in Redirect.objects.all():
    print(f"Old path: {redirect.old_path}, Redirect to: {redirect.redirect_link}")
