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
    from home.models import Aluno, Professor, PlatformSettings, HomeBanner
    from django.contrib.auth.models import User
    
    context = {
        'alunos': Aluno.objects.select_related('user').all(),
        'professores': Professor.objects.select_related('user').all(),
        'all_users': User.objects.filter(is_active=True).exclude(is_superuser=True),
        'banners': HomeBanner.objects.all(),
        'settings': PlatformSettings.get_settings(),
        'active_tab': request.GET.get('tab', 'alunos'),
    }
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
        if not aluno:
            return JsonResponse({'status': 'error', 'message': 'Perfil de aluno não encontrado.'}, status=404)
        
        return JsonResponse({
            'status': 'success',
            'username': request.user.username,
            'curso': aluno.get_curso_display(),
            'ano': aluno.ano_inicio,
            'pontos': aluno.pontos
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