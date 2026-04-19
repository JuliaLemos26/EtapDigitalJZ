from wagtail import urls as wagtail_urls
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.documents import urls as wagtaildocs_urls
from django.views.generic import RedirectView
from core import views as core_views
from search import views as search_views
from core.views import (IndexView, dashboard, spa_page, admin_dashboard, get_user_profile, 
    update_username, set_duck_name, save_avatar_part, delete_avatar_part,
    create_outfit, delete_outfit, lojinha_data, buy_outfit)
from .views import user_logout

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("admin/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),

    path("accounts/", include("core.signup_urls")),
    path("accounts/", include("django.contrib.auth.urls")),
    path("accounts/profile/", RedirectView.as_view(url="/index/")),

    #path("search/", search_views.search, name="search"),
    #path("", include(wagtail_urls)),  
    #path("login/", signup, name="login"),
    #path("signup/", signup, name="signup"),

    path("search/", search_views.search, name="search"),
    path("index/", IndexView.as_view(), name="index"),
    path("dashboard/", dashboard, name="dashboard"),
    path('pages/<str:page_name>/', spa_page, name='spa-page'),
    path('logout/', user_logout, name='logout'),
    path('admin-dashboard/', admin_dashboard, name='admin-dashboard'),
    path('admin-dashboard/user/<int:user_id>/action/', core_views.admin_user_action, name='admin_user_action'),
    path('admin-dashboard/user/<int:user_id>/relocate/', core_views.admin_user_relocate, name='admin_user_relocate'),
    path('admin-dashboard/banners/', core_views.manage_banners, name='manage_banners'),
    path('admin-dashboard/toggle-platform/', core_views.toggle_platform, name='toggle_platform'),
    path('admin-dashboard/avisos/send/', core_views.send_aviso, name='send_aviso'),
    path('admin-dashboard/avisos/<int:aviso_id>/delete/', core_views.delete_aviso, name='delete_aviso'),
    path('api/profile/', get_user_profile, name='get_user_profile'),
    path('api/profile/update/', update_username, name='update_username'),
    path('api/profile/duck-name/update/', set_duck_name, name='set_duck_name'),
    path('publications/', include('publications.urls')),
    
    # Avatar Builder admin endpoints
    path('admin-dashboard/avatar/save/', save_avatar_part, name='save_avatar_part'),
    path('admin-dashboard/avatar/<int:part_id>/delete/', delete_avatar_part, name='delete_avatar_part'),
    
    # Outfit management (admin)
    path('admin-dashboard/outfits/create/', create_outfit, name='create_outfit'),
    path('admin-dashboard/outfits/<int:outfit_id>/delete/', delete_outfit, name='delete_outfit'),
    
    # Lojinha API (alunos)
    path('api/lojinha/', lojinha_data, name='lojinha_data'),
    path('api/lojinha/buy/', buy_outfit, name='buy_outfit'),
]


if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    # Serve static and media files from development server
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns = urlpatterns + [
    # For anything not caught by a more specific rule above, hand over to
    # Wagtail's page serving mechanism. This should be the last pattern in
    # the list:
    path("", include(wagtail_urls)),
    # Alternatively, if you want Wagtail pages to be served from a subpath
    # of your site, rather than the site root:
    #    path("pages/", include(wagtail_urls)),
]
