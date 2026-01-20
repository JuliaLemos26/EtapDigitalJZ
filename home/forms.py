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