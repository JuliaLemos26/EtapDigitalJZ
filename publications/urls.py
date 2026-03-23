from django.urls import path
from . import views

urlpatterns = [
    path('delete/<str:post_type>/<int:post_id>/', views.delete_post, name='delete-post'),
    path('get-data/<str:post_type>/<int:post_id>/', views.get_post_data, name='get-post-data'),
    path('edit/<str:post_type>/<int:post_id>/', views.edit_post, name='edit-post'),
    path('meus-arquivos/', views.my_posts, name='my-posts'),
    path('fazer-inscricao/', views.fazer_inscricao, name='fazer-inscricao'),
    path('cancelar-inscricao/', views.cancelar_inscricao, name='cancelar-inscricao'),
    path('listar-inscricoes/<str:post_type>/<int:post_id>/', views.listar_inscricoes_post, name='listar-inscricoes'),
    path('detalhes-inscricao/<int:inscricao_id>/', views.ver_detalhes_inscricao, name='detalhes-inscricao'),
]
