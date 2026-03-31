from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Tarefa, Concurso, Projeto, Evento, Inscricao
from django.apps import apps
from django.core.exceptions import PermissionDenied
from django.db.models import Q
from django.core.paginator import Paginator
from django.utils import timezone

def get_post_model(post_type):
    models = {
        'tarefa': Tarefa,
        'concurso': Concurso,
        'projeto': Projeto,
        'evento': Evento,
    }
    return models.get(post_type)

@login_required
def increment_view_count(request, post_type, post_id):
    model = get_post_model(post_type)
    if not model:
        return JsonResponse({'success': False, 'error': 'Tipo de post inválido'}, status=400)
    
    post = get_object_or_404(model, id=post_id)
    post.views_count += 1
    post.save(update_fields=['views_count'])
    return JsonResponse({'success': True, 'views_count': post.views_count})

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
def fazer_inscricao(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método não permitido'}, status=405)
    
    post_type = request.POST.get('post_type')
    post_id = request.POST.get('post_id')
    titulo = request.POST.get('titulo')
    descricao = request.POST.get('descricao')
    
    if not all([post_type, post_id, titulo, descricao]):
        return JsonResponse({'success': False, 'error': 'Campos obrigatórios ausentes'}, status=400)
    
    model = get_post_model(post_type)
    post = get_object_or_404(model, id=post_id)
    
    # Validar Prazo
    if hasattr(post, 'end_date') and post.end_date and post.end_date < timezone.now():
        return JsonResponse({'success': False, 'error': 'O prazo de inscrição para este post já expirou.'}, status=400)
    
    # Validar Unicidade
    if Inscricao.objects.filter(user=request.user, post_type=post_type, post_id=post_id).exists():
        return JsonResponse({'success': False, 'error': 'Você já está inscrito neste post.'}, status=400)
    
    try:
        inscricao = Inscricao(
            user=request.user,
            post_type=post_type,
            post_id=post_id,
            titulo=titulo,
            descricao=descricao
        )
        if 'arquivo' in request.FILES:
            inscricao.arquivo = request.FILES['arquivo']
        
        inscricao.save()
        return JsonResponse({'success': True, 'message': 'Inscrição realizada com sucesso!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@login_required
def cancelar_inscricao(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método não permitido'}, status=405)
    
    post_type = request.POST.get('post_type')
    post_id = request.POST.get('post_id')
    
    inscricao = get_object_or_404(Inscricao, user=request.user, post_type=post_type, post_id=post_id)
    inscricao.delete()
    return JsonResponse({'success': True, 'message': 'Inscrição cancelada com sucesso.'})

@login_required
def listar_inscricoes_post(request, post_type, post_id):
    model = get_post_model(post_type)
    post = get_object_or_404(model, id=post_id)
    
    # Permissão: Superuser ou Autor
    is_author = post.author == request.user or (hasattr(post, 'secondary_author') and post.secondary_author == request.user)
    if not (request.user.is_superuser or is_author):
        return JsonResponse({'success': False, 'error': 'Sem permissão'}, status=403)
    
    inscricoes = Inscricao.objects.filter(post_type=post_type, post_id=post_id).select_related('user')
    data = []
    for ins in inscricoes:
        data.append({
            'id': ins.id,
            'titulo': ins.titulo,
            'username': ins.user.username,
            'data': ins.created_at.strftime('%d/%m/%Y %H:%M')
        })
    
    return JsonResponse({'success': True, 'inscricoes': data})

@login_required
def ver_detalhes_inscricao(request, inscricao_id):
    inscricao = get_object_or_404(Inscricao, id=inscricao_id)
    
    # Permissão do Autor do Post original
    model = get_post_model(inscricao.post_type)
    post = get_object_or_404(model, id=inscricao.post_id)
    
    is_author = post.author == request.user or (hasattr(post, 'secondary_author') and post.secondary_author == request.user)
    if not (request.user.is_superuser or is_author or inscricao.user == request.user):
        return JsonResponse({'success': False, 'error': 'Sem permissão'}, status=403)
    
    data = {
        'titulo': inscricao.titulo,
        'descricao': inscricao.descricao,
        'username': inscricao.user.username,
        'data': inscricao.created_at.strftime('%d/%m/%Y %H:%M'),
        'arquivo_url': inscricao.arquivo.url if inscricao.arquivo else None,
        'arquivo_nome': inscricao.arquivo.name.split('/')[-1] if inscricao.arquivo else None
    }
    
    return JsonResponse({'success': True, 'data': data})

@login_required
def my_posts(request):
    user = request.user
    active_tab = request.GET.get('tab', 'tarefas')
    page_number = request.GET.get('page', 1)
    
    filter_q = Q(author=user) | Q(secondary_author=user)
    
    counts = {
        'tarefas': Tarefa.objects.filter(filter_q).count(),
        'concursos': Concurso.objects.filter(filter_q).count(),
        'projetos': Projeto.objects.filter(filter_q).count(),
        'eventos': Evento.objects.filter(filter_q).count(),
    }
    
    if active_tab == 'tarefas':
        inscricoes_ids = Inscricao.objects.filter(user=user, post_type='tarefa').values_list('post_id', flat=True)
        queryset = Tarefa.objects.filter(filter_q | Q(id__in=inscricoes_ids)).order_by('-created_at')
    elif active_tab == 'concursos':
        inscricoes_ids = Inscricao.objects.filter(user=user, post_type='concurso').values_list('post_id', flat=True)
        queryset = Concurso.objects.filter(filter_q | Q(id__in=inscricoes_ids)).order_by('-created_at')
    elif active_tab == 'projetos':
        queryset = Projeto.objects.filter(filter_q).order_by('-created_at')
    elif active_tab == 'eventos':
        queryset = Evento.objects.filter(filter_q).order_by('-created_at')
    else:
        queryset = Tarefa.objects.filter(filter_q).order_by('-created_at')
        active_tab = 'tarefas'

    paginator = Paginator(queryset, 6)
    page_obj = paginator.get_page(page_number)
    
    for item in page_obj:
        item.is_author = (item.author == user or (hasattr(item, 'secondary_author') and item.secondary_author == user))
        if not item.is_author:
            item.is_subscribed = True
            try:
                # Verificar se existe uma inscrição para este post
                post_type = active_tab[:-1] if active_tab != 'meus-arquivos' else 'tarefa'
                item.user_inscription = Inscricao.objects.get(user=user, post_type=post_type, post_id=item.id)
            except Inscricao.DoesNotExist:
                item.user_inscription = None
        else:
            item.is_subscribed = False

    context = {
        'page_obj': page_obj,
        'active_tab': active_tab,
        'counts': counts,
    }
    
    return render(request, 'pages/meus_arquivos.html', context)
