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

@login_required
@xframe_options_exempt 
def spa_page(request, page_name):
    allowed_pages = ['home', 'tarefas', 'concursos', 'eventos', 'projetos', 'angariacoes', 'lojinha', 'formpost']
    if page_name not in allowed_pages:
        page_name = 'home'
    
    # Restrição para formpost
    if page_name == 'formpost':
        is_auth = request.user.is_superuser or \
                  request.user.groups.filter(name__in=['Administrador', 'Professor']).exists() or \
                  hasattr(request.user, 'professor_profile')
        
        if not is_auth:
            return render(request, 'pages/home.html')
            
        # Processamento do Formulário (POST)
        if request.method == "POST":
            post_type = request.POST.get('post_type')
            title = request.POST.get('title')
            content = request.POST.get('content')
            image = request.FILES.get('image')
            
            # Dados de autor
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
                        link=request.POST.get('link') # Adicionado se houver
                    )
                messages.success(request, "Post publicado com sucesso!")
            except Exception as e:
                messages.error(request, f"Erro ao publicar: {str(e)}")

        # Contexto extra para o formulário
        context = {
            'alunos': Aluno.objects.all(),
            'page_name': page_name
        }
        return render(request, f'pages/{page_name}.html', context)
        
    return render(request, f'pages/{page_name}.html', {'page_name': page_name})

@user_passes_test(is_admin)
def admin_dashboard(request):
    return render(request, 'admin/dashboard.html')