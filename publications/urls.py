from django.urls import path
from . import views

urlpatterns = [
    path('delete/<str:post_type>/<int:post_id>/', views.delete_post, name='delete-post'),
    path('get-data/<str:post_type>/<int:post_id>/', views.get_post_data, name='get-post-data'),
    path('edit/<str:post_type>/<int:post_id>/', views.edit_post, name='edit-post'),
    path('meus-arquivos/', views.my_posts, name='my-posts'),
]
