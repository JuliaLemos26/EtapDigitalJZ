from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate

class SignupForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def clean_email(self):
        email = self.cleaned_data.get("email")
        dominio = "@etap.pt"

        if not email.lower().endswith(dominio):
            raise ValidationError(f"O email deve ser institucional ({dominio})")

        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
            from .models import Aluno, Professor
            import re
            
            email = user.email.lower()
            aluno_pattern = r"^(tgpsi|tag|tmult|tsj|tcab)(\d{2})[a-z]+@etap\.pt$"
            match = re.match(aluno_pattern, email)

            if match:
                curso = match.group(1)
                ano_inicio = match.group(2)
                Aluno.objects.create(user=user, curso=curso, ano_inicio=ano_inicio)
            else:
                Professor.objects.create(user=user)
        return user

class LoginForm(forms.Form):
    username = forms.CharField(label="Nome de usuário")
    password = forms.CharField(label="Senha", widget=forms.PasswordInput)

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get("username")
        password = cleaned_data.get("password")

        if username and password:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                raise ValidationError("Usuário ou senha inválidos")

            user = authenticate(username=username, password=password)
            if user is None:
                raise ValidationError("Usuário ou senha inválidos")

            self.user = user

        return cleaned_data