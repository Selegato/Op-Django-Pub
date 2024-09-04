from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from sharedForms.shared_forms import CpfForm
from django.contrib import messages
from .services import API_Consulta_Cliente_Cognito, API_Consulta_Vitrine_Cliente,API_Consulta_Oferta_PDV
import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
import json


#reprocessa dados da vitrine do cliente, retornando lista de dicionarios com todas as ofertas do cliente
def flatten_data_vitrine(data):
    flat_data = []
    for vitrine in data['Vitrine']['Vitrines']:
        for oferta in vitrine['Ofertas']:
            oferta_data = {
                'categoria': vitrine.get('Categoria'),
                'codigoofertapdv': oferta.get('CodigoOfertaPDV'),
                'tipooferta': oferta.get('Nome'),
                'produto': oferta.get('DescricaoProduto'),
                'ean': oferta.get('Ean'),
                'imagem': oferta.get('ImagemProduto'),
                'unidade': oferta['Regras'].get('UnidadeDeMedida'),
                'maximo': oferta['Regras'].get('QuantidadeMaxima'),
                'disponivel': oferta['Regras'].get('QuantidadeDisponivel'),
                'inicio': oferta['Regras'].get('DataInicial'),
                'fim': oferta['Regras'].get('DataFinal'),
                'precode': oferta['Regras'].get('PrecoDe', ''),
                'precopor': oferta['Regras'].get('PrecoPor', ''),
                'percentualdesc': oferta['Regras'].get('PercentualDesconto', '')
            }
            flat_data.append(oferta_data)
    return flat_data

#reprocessa dados ofertas ativas do cliente, retorna lista de dicionarios com ofertas ativas e lista de itens aceitos. 
def flatten_ofertas_ativas(ofertas_ativas):
    flatten_data = []
    for oferta in ofertas_ativas['Result']['Ofertas']:
        modalidade = oferta['Modalidade']
        regras = modalidade['Regras']

        #lista com items aceitos na oferta
        itens_aceitos = []
        for item in oferta['Produto']['Items']:
            itens_aceitos.append({
                'codigo': item.get('CodigoInterno'),
                'descricao': item.get('Descricao')
            })

        # cria dicionarios com dados da oferta e junto com lista de itens aceitos.
        ofertas_temp = {
            'codigoofertapdv': oferta.get('CodigoOfertaPDV'),
            'modalidade': modalidade.get('Nome'),
            'precocomdesc': regras.get('PrecoComDesconto',''),
            'percdesc': regras.get('PercentualDesconto',''),
            'quantmax': regras.get('QuantidadeMaxima'),
            'unmed': regras.get('UnidadeDeMedida'),
            'quantdisp': regras.get('QuantidadeDisponivel'),
            'datainicio': regras.get('DataInicial'),
            'datafinal': regras.get('DataFinal'),
            'itensaceitos': itens_aceitos
        }

        flatten_data.append(ofertas_temp)
    return flatten_data



def ofertas(request):
    cpf_form = CpfForm()
    if not request.user.is_authenticated:
        messages.error(request, "Usuario nao logado")
        return redirect('login')
    return render(request,'ofertas/ofertas.html', {'cpf_form': cpf_form})

@ensure_csrf_cookie
@require_POST
@login_required
def consulta_cpf_cognito(request):
    data = json.loads(request.body)
    cpf = data.get('cpf')
    cpf = cpf.replace('.', '').replace('-', '')
    api = API_Consulta_Cliente_Cognito()
    customer_data = api.consulta_cognito(cpf)
    if customer_data.get('message') == 'Customer not found':
        return JsonResponse({'message': 'Customer not found'})
    customer_data = customer_data.get('customer')
    subsidiaries = customer_data.get('subsidiary')
    bandeiras = [subsidiary.get('subsidiaryName') for subsidiary in subsidiaries]
    request.session['subsidiaries'] = subsidiaries
    return JsonResponse ({
    'nome': customer_data.get('firstName'),
    'email': customer_data.get('email'),
    'fone': customer_data.get('phone'),
    'bandeiras': bandeiras
    })

@require_POST
@login_required

def consulta_vitrine(request):
    data = json.loads(request.body)
    bandeira_selecionada = data.get('bandeira')
    subsidiaries = request.session.get('subsidiaries')
    subsidiary = [subsidiary for subsidiary in subsidiaries if bandeira_selecionada == subsidiary['subsidiaryName']]
    app_id = subsidiary[0]['subsidiaryId']
    crm_user_id = subsidiary[0]['crmUserId']
    vitrine_cliente = API_Consulta_Vitrine_Cliente(app_id)
    vitrine_cliente = vitrine_cliente.consulta_vitrine_cliente(crm_user_id)
    cpf = str(vitrine_cliente['Vitrine']['Cpf'])
    vitrine_cliente = flatten_data_vitrine(vitrine_cliente)
    api_pdv = API_Consulta_Oferta_PDV()
    ofertas_ativas = api_pdv.consulta_oferta_pdv(cpf, bandeira_selecionada)
    ofertas_ativas = flatten_ofertas_ativas(ofertas_ativas)
    return JsonResponse ({'vitrine_cliente': vitrine_cliente,
                          'ofertas_ativas' : ofertas_ativas})















