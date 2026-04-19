from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from .forms import SignupForm
from django.views.decorators.clickjacking import xframe_options_exempt
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.models import User
from django.db.models import Q

def is_admin(user):
    return user.is_superuser

@login_required
def dashboard(request):
    return redirect("/index/")

def signup(request):
    signup_form = SignupForm()
    login_form = AuthenticationForm()
    if request.method == "POST":
        if 'password2' in request.POST: 
            signup_form = SignupForm(request.POST)
            if signup_form.is_valid():
                user = signup_form.save()
                login(request, user)
                #return redirect("/index.html#/home")
                return redirect("/index/")
        else:  
            login_form = AuthenticationForm(data=request.POST) 
            if login_form.is_valid():
                user = login_form.get_user()
                login(request, user)
                return redirect("/index/")
    return render(
        request,
        "registration/signup.html",
        {"form": signup_form, "login_form": login_form}
    )

class IndexView(LoginRequiredMixin, TemplateView):
    login_url = '/accounts/login/'
    redirect_field_name = None
    template_name = 'index.html'

def user_logout(request):
    logout(request)
    return redirect('signup')

from publications.models import Tarefa, Concurso, Projeto, Evento, Inscricao
from home.models import Aluno
from django.contrib import messages
from django.utils import timezone
from datetime import timedelta

from django.core.paginator import Paginator

@login_required
@xframe_options_exempt 
def spa_page(request, page_name):
    allowed_pages = ['home', 'tarefas', 'concursos', 'eventos', 'projetos', 'angariacoes', 'lojinha', 'formpost']
    if page_name not in allowed_pages:
        page_name = 'home'
    
    context = {'page_name': page_name}
    page_number = request.GET.get('page', 1)
    filter_type = request.GET.get('filter', 'recentes')

    # Mapeamento de Cursos (Aluno -> Publicação)
    COURSE_MAPPING = {
        'tgpsi': 'GPSI',
        'tag': 'AG',
        'tmult': 'MULT',
        'tsj': 'SJ',
        'tcab': 'CAB',
    }

    # Lógica de Ordenação
    order_by = '-pk' # Recentes por padrão
    if filter_type == 'antigos':
        order_by = 'pk'
    elif filter_type == 'populares':
        order_by = '-views_count'

    # Lógica de Filtragem por Curso
    course_filter = None
    if filter_type == 'meu_curso':
        aluno_profile = getattr(request.user, 'aluno_profile', None)
        if aluno_profile:
            aluno_curso = aluno_profile.curso.lower()
            target_course = COURSE_MAPPING.get(aluno_curso, 'nenhum')
            course_filter = Q(course=target_course) | Q(course='nenhum')
        else:
            # Se não for aluno, não aplica filtro de curso especial (ou filtra apenas 'nenhum')
            course_filter = Q(course='nenhum')

    # Carregar dados específicos por página com filtro
    now = timezone.now()
    if page_name == 'home':
        from home.models import HomeBanner, SystemAviso
        context['tarefas_recentes'] = Tarefa.objects.filter(Q(end_date__isnull=True) | Q(end_date__gte=now)).order_by('-pk')[:6]
        context['concursos_recentes'] = Concurso.objects.filter(Q(end_date__isnull=True) | Q(end_date__gte=now)).order_by('-pk')[:6]
        context['projetos_recentes'] = Projeto.objects.all().order_by('-pk')[:6]
        context['banners'] = HomeBanner.objects.filter(is_active=True)
        
        # Filtros de avisos para o utilizador atual
        if request.user.is_authenticated:
            aluno_prof = getattr(request.user, 'aluno_profile', None)
            u_course = aluno_prof.curso.lower() if aluno_prof else 'nenhum'
            u_year = aluno_prof.ano_inicio if aluno_prof else 'todos'
            
            avisos = SystemAviso.objects.filter(
                Q(expiration_date__isnull=True) | Q(expiration_date__gte=now)
            ).filter(
                Q(type='geral') |
                Q(type='filtrado', target_course__in=['', None, u_course], target_year__in=['', None, u_year]) |
                Q(type='particular', target_user=request.user)
            ).order_by('-created_at')[:3]
            context['avisos'] = avisos
    elif page_name == 'tarefas':
        queryset = Tarefa.objects.filter(Q(end_date__isnull=True) | Q(end_date__gte=now)).order_by(order_by)
        if course_filter: queryset = queryset.filter(course_filter)
        paginator = Paginator(queryset, 8)
        context['tarefas'] = paginator.get_page(page_number)
    elif page_name == 'concursos':
        queryset = Concurso.objects.filter(Q(end_date__isnull=True) | Q(end_date__gte=now - timedelta(days=1))).order_by(order_by)
        if course_filter: queryset = queryset.filter(course_filter)
        final_qs_ids = []
        for c in queryset:
            if c.end_date and c.end_date < now:
                if Inscricao.objects.filter(user=request.user, post_type='concurso', post_id=c.id).exists():
                    final_qs_ids.append(c.id)
            else:
                final_qs_ids.append(c.id)
        queryset = Concurso.objects.filter(id__in=final_qs_ids).order_by(order_by)
        paginator = Paginator(queryset, 8)
        context['concursos'] = paginator.get_page(page_number)
    elif page_name == 'projetos':
        queryset = Projeto.objects.all().order_by(order_by)
        if course_filter: queryset = queryset.filter(course_filter)
        paginator = Paginator(queryset, 6)
        context['projetos'] = paginator.get_page(page_number)
    elif page_name == 'eventos':
        queryset = Evento.objects.all().order_by(order_by)
        if course_filter: queryset = queryset.filter(course_filter)
        paginator = Paginator(queryset, 6)
        context['eventos'] = paginator.get_page(page_number)
    
    context['current_filter'] = filter_type
    
    # Restrição e lógica para formpost
    if page_name == 'formpost':
        is_auth = request.user.is_superuser or \
                  request.user.groups.filter(name__in=['Administrador', 'Professor']).exists() or \
                  hasattr(request.user, 'professor_profile')
        
        if not is_auth:
            return render(request, 'pages/home.html', context)
            
        if request.method == "POST":
            post_type = request.POST.get('post_type')
            title = request.POST.get('title')
            content = request.POST.get('content')
            image = request.FILES.get('image')
            author = request.user

            sec_author_id = request.POST.get('secondary_author')
            secondary_author = User.objects.get(id=sec_author_id) if sec_author_id else None

            try:
                if post_type == 'tarefa':
                    Tarefa.objects.create(
                        title=title, content=content, author=author, secondary_author=secondary_author,
                        image=image, course=request.POST.get('course'), 
                        school_year=request.POST.get('school_year'),
                        end_date=request.POST.get('end_date') or None,
                        participant_limit=request.POST.get('participant_limit') or 0
                    )
                elif post_type == 'concurso':
                    Concurso.objects.create(
                        title=title, content=content, author=author, secondary_author=secondary_author,
                        image=image, course=request.POST.get('course'),
                        school_year=request.POST.get('school_year'),
                        end_date=request.POST.get('end_date') or None,
                        document=request.FILES.get('document')
                    )
                elif post_type == 'projeto':
                    Projeto.objects.create(
                        title=title, content=content, author=author, secondary_author=secondary_author,
                        image=image, course=request.POST.get('course'),
                        school_year=request.POST.get('school_year'),
                        document=request.FILES.get('document')
                    )
                elif post_type == 'evento':
                    Evento.objects.create(
                        title=title, content=content, author=author,
                        image=image, expiration_date=request.POST.get('end_date') or None,
                        link=request.POST.get('link'),
                        course=request.POST.get('course', 'nenhum'),
                        school_year=request.POST.get('school_year', 'todos')
                    )
                messages.success(request, "Post publicado com sucesso!")
            except Exception as e:
                messages.error(request, f"Erro ao publicar: {str(e)}")

        context['alunos'] = Aluno.objects.all()

    return render(request, f'pages/{page_name}.html', context)

@user_passes_test(is_admin)
def admin_dashboard(request):
    from home.models import Aluno, Professor, PlatformSettings, HomeBanner, AvatarPart, Outfit
    from django.contrib.auth.models import User
    
    active_tab = request.GET.get('tab', 'alunos')
    context = {
        'alunos': Aluno.objects.select_related('user').all(),
        'professores': Professor.objects.select_related('user').all(),
        'all_users': User.objects.filter(is_active=True).exclude(is_superuser=True),
        'banners': HomeBanner.objects.all(),
        'settings': PlatformSettings.get_settings(),
        'active_tab': active_tab,
        'avisos_ativos': SystemAviso.objects.all(),
        'avatar_parts': AvatarPart.objects.filter(is_base=True).order_by('z_index'),
        'outfits': Outfit.objects.prefetch_related('parts', 'creator', 'uploaded_by').all().order_by('-created_at'),
    }

    if active_tab == 'outfit_builder':
        outfit_id = request.GET.get('outfit_id')
        if outfit_id:
            context['outfit_to_edit'] = Outfit.objects.get(id=outfit_id)

    return render(request, 'pages/admin_dashboard.html', context)


from django.http import JsonResponse
from django.views.decorators.http import require_POST
from home.models import Aluno, PlatformSettings, HomeBanner, SystemAviso

@require_POST
@user_passes_test(is_admin)
def admin_user_action(request, user_id):
    from django.contrib.auth.models import Group, User
    action = request.POST.get('action')
    try:
        u = User.objects.get(id=user_id)
        if action == 'suspend':
            u.is_active = False
            u.save()
            return JsonResponse({'status': 'success', 'message': 'Utilizador suspenso.'})
        elif action == 'unsuspend':
            u.is_active = True
            u.save()
            return JsonResponse({'status': 'success', 'message': 'Utilizador reativado.'})
        elif action == 'promote':
            u.is_staff = True
            u.is_superuser = True
            u.save()
            return JsonResponse({'status': 'success', 'message': 'Promovido a Administrador Master.'})
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Utilizador não encontrado.'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Ação inválida.'}, status=400)


@require_POST
@user_passes_test(is_admin)
def admin_user_relocate(request, user_id):
    try:
        curso = request.POST.get('curso')
        ano = request.POST.get('ano')
        aluno = Aluno.objects.get(user__id=user_id)
        aluno.curso = curso
        aluno.ano_inicio = ano
        aluno.save()
        return JsonResponse({'status': 'success', 'message': 'Turma alterada com sucesso.'})
    except Aluno.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Aluno não encontrado.'}, status=404)


@require_POST
@user_passes_test(is_admin)
def toggle_platform(request):
    settings = PlatformSettings.get_settings()
    settings.is_suspended = not settings.is_suspended
    settings.save()
    status_str = "suspensa" if settings.is_suspended else "reativada"
    return JsonResponse({'status': 'success', 'message': f'Plataforma {status_str} com sucesso.'})


@require_POST
@user_passes_test(is_admin)
def manage_banners(request):
    action = request.POST.get('action')
    if action == 'add':
        title = request.POST.get('title')
        order = request.POST.get('order', 0)
        file = request.FILES.get('file')
        if file:
            HomeBanner.objects.create(title=title, order=order, file=file)
            return JsonResponse({'status': 'success', 'message': 'Banner adicionado.'})
        return JsonResponse({'status': 'error', 'message': 'Ficheiro obrigatório.'}, status=400)
    
    banner_id = request.POST.get('banner_id')
    try:
        banner = HomeBanner.objects.get(id=banner_id)
        if action == 'toggle':
            banner.is_active = not banner.is_active
            banner.save()
            return JsonResponse({'status': 'success', 'message': 'Estado do banner alterado.'})
        elif action == 'delete':
            banner.delete()
            return JsonResponse({'status': 'success', 'message': 'Banner eliminado.'})
    except HomeBanner.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Banner não encontrado.'}, status=404)
    
    return JsonResponse({'status': 'error', 'message': 'Ação inválida.'}, status=400)


@require_POST
@user_passes_test(is_admin)
def send_aviso(request):
    from django.contrib.auth.models import User
    title = request.POST.get('title')
    content = request.POST.get('content')
    type = request.POST.get('type')
    target_course = request.POST.get('target_course')
    target_year = request.POST.get('target_year')
    user_destiny_id = request.POST.get('user_destiny')
    expiration_date = request.POST.get('expiration_date') or None

    try:
        user_destiny = User.objects.get(id=user_destiny_id) if user_destiny_id else None
        SystemAviso.objects.create(
            title=title,
            content=content,
            type=type,
            target_course=target_course,
            target_year=target_year,
            target_user=user_destiny,
            expiration_date=expiration_date
        )
        return JsonResponse({'status': 'success', 'message': 'Aviso publicado e enviado.'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@login_required
def get_user_profile(request):
    try:
        aluno = getattr(request.user, 'aluno_profile', None)
        
        from home.models import AvatarPart, UserAvatarState
        base_parts = AvatarPart.objects.filter(is_base=True).order_by('z_index')
        parts_data = []
        for part in base_parts:
            parts_data.append({
                'id': part.id,
                'image': part.image.url if part.image else '',
                'label': part.label,
                'z_index': part.z_index,
                'pos_x': part.pos_x,
                'pos_y': part.pos_y,
                'scale': part.scale,
                'is_base': True
            })
        
        # Integrar roupa equipada
        avatar_state = getattr(request.user, 'avatar_state', None)
        if avatar_state and avatar_state.active_outfit:
            for p in avatar_state.active_outfit.parts.all():
                parts_data.append({
                    'id': p.id,
                    'image': p.image.url if p.image else '',
                    'label': getattr(p, 'label', ''),
                    'z_index': p.z_index,
                    'pos_x': p.pos_x,
                    'pos_y': p.pos_y,
                    'scale': p.scale,
                    'is_base': False
                })
        
        # Ordenação Final por Z-Index
        parts_data.sort(key=lambda x: x['z_index'])

            
        return JsonResponse({
            'status': 'success',
            'username': request.user.username,
            'curso': aluno.get_curso_display() if aluno else "Administração",
            'ano': aluno.ano_escolar_label if aluno else "N/A",
            'ano_inicio_raw': aluno.ano_inicio if aluno else "",
            'patinho_nome': (aluno.patinho_nome if aluno else None) or "Pato Admin",
            'avatar_parts': parts_data,
            'pontos': aluno.pontos_disponiveis if aluno else 999999,
            'active_outfit_id': avatar_state.active_outfit.id if avatar_state and avatar_state.active_outfit else None
        })

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@require_POST
@login_required
def update_username(request):
    new_username = request.POST.get('username')
    if not new_username:
        return JsonResponse({'status': 'error', 'message': 'O nome de usuário não pode estar vazio.'}, status=400)
    
    # Verificar se o username já existe
    if User.objects.filter(username=new_username).exclude(id=request.user.id).exists():
        return JsonResponse({'status': 'error', 'message': 'Este nome de usuário já está em uso.'}, status=400)
    
    try:
        request.user.username = new_username
        request.user.save()
        return JsonResponse({'status': 'success', 'message': 'Nome de usuário atualizado com sucesso!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@require_POST
@user_passes_test(is_admin)
def delete_aviso(request, aviso_id):
    try:
        aviso = SystemAviso.objects.get(id=aviso_id)
        aviso.delete()
        return JsonResponse({'status': 'success', 'message': 'Aviso removido com sucesso.'})
    except SystemAviso.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Aviso não encontrado.'}, status=404)


@require_POST
@login_required
def update_student_profile(request):
    """Atualiza o nome do patinho e o ano de matrícula do aluno."""
    try:
        aluno = request.user.aluno_profile
        
        if 'patinho_nome' in request.POST:
            new_name = request.POST.get('patinho_nome')
            if new_name:
                aluno.patinho_nome = new_name
        
        if 'ano_inicio' in request.POST:
            new_year = request.POST.get('ano_inicio')
            if new_year:
                aluno.ano_inicio = new_year
                
        aluno.save()
        return JsonResponse({
            'status': 'success', 
            'message': 'Perfil atualizado com sucesso!',
            'new_label': aluno.ano_escolar_label
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@require_POST
@user_passes_test(is_admin)
def save_avatar_part(request):
    from home.models import AvatarPart
    # Se ID existe, estamos a editar (apenas posições/z-index)
    part_id = request.POST.get('part_id')
    if part_id:
        try:
            part = AvatarPart.objects.get(id=part_id)
            part.z_index = int(request.POST.get('z_index', part.z_index))
            part.pos_x = int(request.POST.get('pos_x', part.pos_x))
            part.pos_y = int(request.POST.get('pos_y', part.pos_y))
            if 'scale' in request.POST:
                part.scale = float(str(request.POST.get('scale', part.scale)).replace(',', '.'))
            part.save()
            return JsonResponse({'status': 'success', 'message': 'Posição guardada com sucesso.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    # Se não há ID, estamos a criar
    label = request.POST.get('label')
    image = request.FILES.get('image')
    z_index = int(request.POST.get('z_index', 0))
    
    if not label or not image:
        return JsonResponse({'status': 'error', 'message': 'Faltam dados da parte do pato.'}, status=400)
        
    try:
        AvatarPart.objects.create(
            is_base=True,
            image=image,
            z_index=z_index,
            label=label,
            pos_x=0,
            pos_y=0
        )
        return JsonResponse({'status': 'success', 'message': 'Parte do patinho adicionada!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@require_POST
@user_passes_test(is_admin)
def delete_avatar_part(request, part_id):
    from home.models import AvatarPart
    try:
        part = AvatarPart.objects.get(id=part_id)
        part.delete()
        return JsonResponse({'status': 'success', 'message': 'Parte apagada com sucesso.'})
    except AvatarPart.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Parte não encontrada.'}, status=404)


# ─── OUTFIT MANAGEMENT ────────────────────────────────────────────────

@require_POST
@user_passes_test(is_admin)
def create_outfit(request):
    from home.models import Outfit
    from django.contrib.auth.models import User
    try:
        name = request.POST.get('name')
        price = int(request.POST.get('price', 0))
        preview = request.FILES.get('preview_image')
        creator_id = request.POST.get('creator')
        creator_user = User.objects.get(id=creator_id) if creator_id else None
        
        if not name:
            return JsonResponse({'status': 'error', 'message': 'Nome obrigatório.'}, status=400)
        outfit = Outfit.objects.create(
            name=name,
            price=price,
            uploaded_by=request.user,
            creator=creator_user,
            preview_image=preview,
        )
        return JsonResponse({'status': 'success', 'message': f'Outfit "{name}" criado!', 'outfit_id': outfit.id})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@require_POST
@user_passes_test(is_admin)
def delete_outfit(request, outfit_id):
    from home.models import Outfit
    try:
        outfit = Outfit.objects.get(id=outfit_id)
        outfit.delete()
        return JsonResponse({'status': 'success', 'message': 'Outfit apagado.'})
    except Outfit.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Outfit não encontrado.'}, status=404)

@require_POST
@user_passes_test(is_admin)
def save_outfit_part(request):
    from home.models import OutfitPart, Outfit
    part_id = request.POST.get('part_id')
    
    if part_id:
        try:
            part = OutfitPart.objects.get(id=part_id)
            part.z_index = int(request.POST.get('z_index', part.z_index))
            part.pos_x = int(request.POST.get('pos_x', part.pos_x))
            part.pos_y = int(request.POST.get('pos_y', part.pos_y))
            part.scale = float(request.POST.get('scale', part.scale))
            part.save()
            return JsonResponse({'status': 'success', 'message': 'Camada salva.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    outfit_id = request.POST.get('outfit_id')
    image = request.FILES.get('image')
    z_index = int(request.POST.get('z_index', 0))
    
    if not outfit_id or not image:
        return JsonResponse({'status': 'error', 'message': 'Faltam dados da camada da roupa.'}, status=400)
        
    try:
        outfit = Outfit.objects.get(id=outfit_id)
        OutfitPart.objects.create(
            outfit=outfit,
            image=image,
            z_index=z_index,
            pos_x=0,
            pos_y=0
        )
        return JsonResponse({'status': 'success', 'message': 'Camada adicionada à roupa!'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@require_POST
@user_passes_test(is_admin)
def delete_outfit_part(request, part_id):
    from home.models import OutfitPart
    try:
        part = OutfitPart.objects.get(id=part_id)
        part.delete()
        return JsonResponse({'status': 'success', 'message': 'Camada da roupa apagada com sucesso.'})
    except OutfitPart.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Camada não encontrada.'}, status=404)


@login_required
def lojinha_data(request):
    """API endpoint: returns outfits list and user points for the shop."""
    from home.models import Outfit, OutfitPurchase
    outfits = Outfit.objects.prefetch_related('parts').all().order_by('-created_at')
    aluno = getattr(request.user, 'aluno_profile', None)
    pontos = aluno.pontos_disponiveis if aluno else 0

    # IDs já comprados
    purchased_ids = []
    if aluno:
        purchased_ids = list(OutfitPurchase.objects.filter(user=request.user).values_list('outfit_id', flat=True))

    data = []
    for o in outfits:
        parts = []
        for p in o.parts.all():
            parts.append({
                'image': p.image.url if p.image else '',
                'label': getattr(p, 'label', ''), # OutfitPart não tem label por padrão
                'z_index': p.z_index,
                'pos_x': p.pos_x,
                'pos_y': p.pos_y,
                'scale': p.scale,
            })
            
        creator_name = o.creator.username if o.creator else None
        uploader_name = o.uploaded_by.username if o.uploaded_by else 'Admin'

        data.append({
            'id': o.id,
            'name': o.name,
            'price': o.price,
            'preview_image': o.preview_image.url if o.preview_image else '',
            'parts': parts,
            'purchased': o.id in purchased_ids,
            'creator': creator_name,
            'uploader': uploader_name,
        })

    return JsonResponse({'status': 'success', 'outfits': data, 'pontos': pontos, 'purchased_ids': purchased_ids})


@require_POST
@login_required
def buy_outfit(request):
    """Purchase an outfit by deducting points."""
    from home.models import Outfit, OutfitPurchase
    outfit_id = request.POST.get('outfit_id')
    try:
        outfit = Outfit.objects.get(id=outfit_id)
        aluno = request.user.aluno_profile
        if OutfitPurchase.objects.filter(user=request.user, outfit=outfit).exists():
            return JsonResponse({'status': 'error', 'message': 'Já tens este outfit!'}, status=400)
        if aluno.pontos_disponiveis < outfit.price:
            return JsonResponse({'status': 'error', 'message': 'Pontos insuficientes!'}, status=400)
        OutfitPurchase.objects.create(user=request.user, outfit=outfit)
        aluno.pontos_gastos += outfit.price
        aluno.save()
        return JsonResponse({'status': 'success', 'message': f'"{outfit.name}" adquirido! 🎉', 'new_pontos': aluno.pontos_disponiveis})
    except Outfit.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Outfit não encontrado.'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@login_required
def wardrobe_data(request):
    """API endpoint: returns purchased outfits for the wardrobe."""
    from home.models import Outfit, OutfitPurchase, UserAvatarState
    purchased_outfits = Outfit.objects.filter(outfitpurchase__user=request.user).prefetch_related('parts')
    
    avatar_state = getattr(request.user, 'avatar_state', None)
    active_id = avatar_state.active_outfit.id if avatar_state and avatar_state.active_outfit else None

    data = []
    for o in purchased_outfits:
        parts = []
        for p in o.parts.all():
            parts.append({
                'image': p.image.url if p.image else '',
                'label': getattr(p, 'label', ''),
                'z_index': p.z_index,
                'pos_x': p.pos_x,
                'pos_y': p.pos_y,
                'scale': p.scale,
            })
        data.append({
            'id': o.id,
            'name': o.name,
            'preview_image': o.preview_image.url if o.preview_image else '',
            'parts': parts,
            'is_active': o.id == active_id
        })

    return JsonResponse({'status': 'success', 'outfits': data, 'active_id': active_id})


@require_POST
@login_required
def equip_outfit(request):
    """Equip or unequip an outfit."""
    from home.models import Outfit, OutfitPurchase, UserAvatarState
    outfit_id = request.POST.get('outfit_id')
    
    avatar_state, created = UserAvatarState.objects.get_or_create(user=request.user)
    
    if not outfit_id:
        # Desequipar
        avatar_state.active_outfit = None
        avatar_state.save()
        return JsonResponse({'status': 'success', 'message': 'Agora estás a usar o Pato básico!'})

    try:
        # Verificar se o utilizador possui o outfit
        if not OutfitPurchase.objects.filter(user=request.user, outfit_id=outfit_id).exists():
            return JsonResponse({'status': 'error', 'message': 'Não possuis este outfit!'}, status=403)
            
        outfit = Outfit.objects.get(id=outfit_id)
        avatar_state.active_outfit = outfit
        avatar_state.save()
        return JsonResponse({'status': 'success', 'message': f'"{outfit.name}" equipado com sucesso!', 'outfit_id': outfit.id})
    except Outfit.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Outfit não encontrado.'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)



