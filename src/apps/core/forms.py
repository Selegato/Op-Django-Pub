from django import forms

class LoginForms(forms.Form):
    username = forms.CharField(
        required=True,
        max_length=50,
        widget = forms.TextInput(
            attrs = {
                'class':"form-control mb-1",
                'placeholder':'Usuario'
            }
        )
    )
    password = forms.CharField(
        required=True,
        max_length=50,
        widget=forms.PasswordInput(
            attrs = {
                'class':"form-control mb-1",
                'placeholder':'Senha'
            }
        )
    )