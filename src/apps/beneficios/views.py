from django.shortcuts import render, redirect
from sharedForms.shared_forms import CpfForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
import json
from .services import Api_Consulta_Beneficios, Api_Baixa_Beneficios
from django.http import JsonResponse

# Create your views here.

def beneficios(request):
    form = CpfForm()
    if not request.user.is_authenticated:
        messages.error(request, "Usuario nao logado")
        return redirect('login')
    return render(request, 'beneficios/beneficios.html',{'cpf_form': form})

@ensure_csrf_cookie
@require_POST
@login_required
def consulta_beneficios(request):
    data = json.loads(request.body)
    cpf = data.get('cpf')
    #TODO verificar depois porque o form nao esta retirando os pontos do cpf
    cpf = cpf.replace('.', '').replace('-', '')
    #  correcao momentanea
    request.session['cpf'] = cpf
    api = Api_Consulta_Beneficios()
    response = api.consulta_beneficios(cpf)
    if response.get('error') == 'Customer not found':
        return JsonResponse({'message': 'Customer not found'})
    nome = response['Cliente'][0].get('Nome')
    email = response['Cliente'][0].get('Email')
    telefone = response['Cliente'][0].get('Telefone')
    beneficios = response.get('Beneficios')
    request.session['beneficios'] = beneficios
    return JsonResponse ({
    'nome': nome,
    'email': email,
    'fone': telefone,
    'beneficios': beneficios,
    })

@ensure_csrf_cookie
@require_POST
@login_required
def baixar_beneficios(request):
    data = json.loads(request.body)
    selected_ids = data.get('beneficios', [])
    bandeira = data.get('bandeira')

    selected_ids = [int(id) for id in selected_ids]
    beneficios = request.session.get('beneficios')
    selected_beneficios = []
    for beneficio in beneficios:
        if beneficio.get('IdBeneficioUser') in selected_ids:
            selected_beneficios.append(beneficio)
    cpf = request.session.get('cpf')
    print(selected_beneficios)
    api = Api_Baixa_Beneficios()
    result = api.baixa_beneficio(bandeira=bandeira,ticket="123456",cpf=cpf,beneficios=selected_beneficios)
    return JsonResponse(result)