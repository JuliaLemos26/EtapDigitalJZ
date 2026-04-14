from django.shortcuts import render
from django.urls import reverse
from home.models import PlatformSettings

class PlatformSuspensionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Fetch the suspension setting
        setting = PlatformSettings.get_settings()
        
        if setting and setting.is_suspended:
            # Admins (superusers) always bypass
            if request.user.is_authenticated and request.user.is_superuser:
                return self.get_response(request)
            
            # Paths that must remain accessible
            allowed_paths = [
                '/accounts/login/', 
                '/accounts/logout/', 
                '/admin/', 
                '/django-admin/',
                '/static/',
                '/media/'
            ]
            
            # Check if current path is allowed
            is_allowed = any(request.path.startswith(path) for path in allowed_paths)
            
            if not is_allowed:
                # Render maintenance page for everyone else
                return render(request, 'pages/maintenance.html', status=503)

        return self.get_response(request)
