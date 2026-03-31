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

from publications.models import Tarefa, Concurso, Projeto, Evento
from home.models import Aluno
from django.contrib import messages

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
    if page_name == 'home':
        context['tarefas_recentes'] = Tarefa.objects.all().order_by('-pk')[:6]
        context['concursos_recentes'] = Concurso.objects.all().order_by('-pk')[:6]
        context['projetos_recentes'] = Projeto.objects.all().order_by('-pk')[:6]
    elif page_name == 'tarefas':
        queryset = Tarefa.objects.all().order_by(order_by)
        if course_filter: queryset = queryset.filter(course_filter)
        paginator = Paginator(queryset, 8)
        context['tarefas'] = paginator.get_page(page_number)
    elif page_name == 'concursos':
        queryset = Concurso.objects.all().order_by(order_by)
        if course_filter: queryset = queryset.filter(course_filter)
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
    return render(request, 'admin/dashboard.html')