from wagtail import urls as wagtail_urls
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.documents import urls as wagtaildocs_urls
from django.views.generic import RedirectView
from core.views import IndexView, dashboard
from search import views as search_views
from core.views import IndexView, spa_page
from django.urls import path
from .views import user_logout

urlpatterns = [
    #minha parte
    path("django-admin/", admin.site.urls),
    path("admin/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),

    #parte autenticaçao
    path("accounts/", include("core.signup_urls")),
    path("accounts/", include("django.contrib.auth.urls")),
    path("accounts/profile/", RedirectView.as_view(url="/index/")),

    #path("search/", search_views.search, name="search"),
    #path("", include(wagtail_urls)),  
    #path("login/", signup, name="login"),
    #path("signup/", signup, name="signup"),

    path('index/', IndexView.as_view(), name='index'),
    path("search/", search_views.search, name="search"),
    path("index/", IndexView.as_view(), name="index"),
    path("dashboard/", dashboard, name="dashboard"),
    path('pages/<str:page_name>/', spa_page, name='spa-page'),
    path('logout/', user_logout, name='logout'),
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
