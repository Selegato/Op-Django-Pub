from django.shortcuts import render, redirect
from .forms import LoginForms
from django.contrib import auth
from django.contrib import messages

# Create your views here.

def index(request):
    if not request.user.is_authenticated:
        messages.error(request, "Usuario nao logado")
        return redirect('login')
    return render(request,'base.html')

def login(request):
    form = LoginForms()

    if request.method == 'POST':

        form = LoginForms(request.POST)

        if form.is_valid():
            username = form['username'].value()
            pw = form['password'].value()

        user = auth.authenticate(
            request,
            username=username,
            password=pw
        )
        if user is not None:
            auth.login(request, user)
            return redirect('index')
        else:
            messages.error(request, 'Usuario ou senha invalidos')
            return redirect('login')
        
    return render(request, 'core/login.html', {'form': form})

def logout(request):
    auth.logout(request)
    messages.success(request,"Logout Realizado")
    return redirect('login')
