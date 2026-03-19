from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Tarefa, Concurso, Projeto, Evento
from django.apps import apps
from django.core.exceptions import PermissionDenied
from django.db.models import Q
from django.core.paginator import Paginator

def get_post_model(post_type):
    models = {
        'tarefa': Tarefa,
        'concurso': Concurso,
        'projeto': Projeto,
        'evento': Evento,
    }
    return models.get(post_type)

@login_required
def delete_post(request, post_type, post_id):
    model = get_post_model(post_type)
    if not model:
        return JsonResponse({'success': False, 'error': 'Tipo de post inválido'}, status=400)
    
    post = get_object_or_404(model, id=post_id)
    
    # Verificação de Permissão
    is_author = post.author == request.user or (hasattr(post, 'secondary_author') and post.secondary_author == request.user)
    if not (request.user.is_superuser or is_author):
        return JsonResponse({'success': False, 'error': 'Você não tem permissão para excluir este post'}, status=403)
    
    if request.method == 'POST':
        post.delete()
        return JsonResponse({'success': True, 'message': 'Post excluído com sucesso!'})
    
    return JsonResponse({'success': False, 'error': 'Método não permitido'}, status=405)

@login_required
def get_post_data(request, post_type, post_id):
    """Retorna os dados do post para preencher o formulário de edição"""
    model = get_post_model(post_type)
    if not model:
        return JsonResponse({'success': False, 'error': 'Tipo de post inválido'}, status=400)
    
    post = get_object_or_404(model, id=post_id)
    
    # Verificação de Permissão
    is_author = post.author == request.user or (hasattr(post, 'secondary_author') and post.secondary_author == request.user)
    if not (request.user.is_superuser or is_author):
        return JsonResponse({'success': False, 'error': 'Sem permissão'}, status=403)

    data = {
        'title': post.title,
        'content': post.content,
        'id': post.id,
        'type': post_type,
    }
    
    # Campos específicos
    if hasattr(post, 'course'): data['course'] = post.course
    if hasattr(post, 'school_year'): data['school_year'] = post.school_year
    if hasattr(post, 'secondary_author'): data['secondary_author'] = post.secondary_author.id if post.secondary_author else ''
    if hasattr(post, 'end_date') and post.end_date: data['end_date'] = post.end_date.strftime('%Y-%m-%dT%H:%M')
    if hasattr(post, 'expiration_date') and post.expiration_date: data['end_date'] = post.expiration_date.strftime('%Y-%m-%dT%H:%M')
    if hasattr(post, 'participant_limit'): data['participant_limit'] = post.participant_limit
    if hasattr(post, 'link'): data['link'] = post.link

    return JsonResponse({'success': True, 'data': data})

@login_required
def edit_post(request, post_type, post_id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método não permitido'}, status=405)

    model = get_post_model(post_type)
    if not model:
        return JsonResponse({'success': False, 'error': 'Tipo de post inválido'}, status=400)
    
    post = get_object_or_404(model, id=post_id)
    
    # Verificação de Permissão
    is_author = post.author == request.user or (hasattr(post, 'secondary_author') and post.secondary_author == request.user)
    if not (request.user.is_superuser or is_author):
        return JsonResponse({'success': False, 'error': 'Sem permissão'}, status=403)

    try:
        # Atualizar campos comuns
        post.title = request.POST.get('title', post.title)
        post.content = request.POST.get('content', post.content)
        
        if 'image' in request.FILES:
            post.image = request.FILES['image']
            
        # Campos específicos
        if hasattr(post, 'course'):
            post.course = request.POST.get('course', post.course)
        if hasattr(post, 'school_year'):
            post.school_year = request.POST.get('school_year', post.school_year)
        if hasattr(post, 'participant_limit'):
            post.participant_limit = request.POST.get('participant_limit', post.participant_limit)
        if hasattr(post, 'link'):
            post.link = request.POST.get('link', post.link)
            
        # Datas
        if hasattr(post, 'end_date'):
            val = request.POST.get('end_date')
            post.end_date = val if val else None
        if hasattr(post, 'expiration_date'):
            val = request.POST.get('end_date') # No formulário JS eu usei end_date para ambos
            post.expiration_date = val if val else None
            
        # Documentos
        if hasattr(post, 'document') and 'document' in request.FILES:
            post.document = request.FILES['document']

        post.save()
        return JsonResponse({'success': True, 'message': 'Post atualizado com sucesso!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@login_required
def my_posts(request):
    user = request.user
    active_tab = request.GET.get('tab', 'tarefas')
    page_number = request.GET.get('page', 1)
    
    filter_q = Q(author=user) | Q(secondary_author=user)
    
    # Contagens para o cabeçalho das abas
    counts = {
        'tarefas': Tarefa.objects.filter(filter_q).count(),
        'concursos': Concurso.objects.filter(filter_q).count(),
        'projetos': Projeto.objects.filter(filter_q).count(),
        'eventos': Evento.objects.filter(filter_q).count(),
    }
    
    # Seleção do queryset baseado na aba ativa
    if active_tab == 'concursos':
        queryset = Concurso.objects.filter(filter_q).order_by('-created_at')
    elif active_tab == 'projetos':
        queryset = Projeto.objects.filter(filter_q).order_by('-created_at')
    elif active_tab == 'eventos':
        queryset = Evento.objects.filter(filter_q).order_by('-created_at')
    else:
        queryset = Tarefa.objects.filter(filter_q).order_by('-created_at')
        active_tab = 'tarefas'

    # Paginação: 6 itens por página
    paginator = Paginator(queryset, 6)
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'active_tab': active_tab,
        'counts': counts,
    }
    
    return render(request, 'pages/meus_arquivos.html', context)
