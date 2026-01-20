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

def spa_page(request, page_name):
    allowed_pages = ['home', 'tarefas', 'concursos', 'eventos', 'projetos', 'angariacoes', 'lojinha']
    if page_name not in allowed_pages:
        page_name = 'home'
    return render(request, f'pages/{page_name}.html')

@xframe_options_exempt
def spa_page(request, page_name):
    allowed_pages = ['home', 'tarefas', 'concursos', 'eventos', 'projetos', 'angariacoes', 'lojinha']
    if page_name not in allowed_pages:
        page_name = 'home'
    return render(request, f'pages/{page_name}.html')