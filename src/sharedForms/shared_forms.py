from django import forms
from django.core.exceptions import ValidationError
import re

class CpfForm(forms.Form):
    cpf = forms.CharField(
        max_length=14,
        min_length=11,
        required=True,
        widget=forms.TextInput(attrs={
            'placeholder': 'Informe cpf',
            'title':'O CPF deve estar no formato 000.000.000-00',
            'pattern': '\d{3}\.\d{3}\.\d{3}-\d{2}',
            'class': 'form-control'
            })
    )

    def clean_cpf(self):
        #recebe os dados apos primeira validacao do formulario.
        cpf = self.cleaned_data.get('cpf')
        
        # Remove pontos e traços
        cpf = re.sub(r'[.-]', '', cpf)

        # Verifica se tem apenas números
        if not cpf.isdigit():
            raise ValidationError('O CPF deve conter apenas números.')

        # Validação do tamanho do CPF
        if len(cpf) != 11:
            raise ValidationError('O CPF deve conter 11 dígitos.')
        
        # Validação simples do CPF (sem biblioteca)
        # if not self.validar_cpf(cpf):
        #     raise ValidationError('CPF inválido.')
        return cpf
    
    
    """ valida o cpf desativado por enquanto
    def validar_cpf(self, cpf):
        # Função para validar o CPF com base nos dígitos verificadores
        
        # Verifica se todos os números são iguais (ex.: 111.111.111-11 é inválido)
        if cpf == cpf[0] * len(cpf):
            return False

        # Cálculo do primeiro dígito verificador
        soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
        digito1 = (soma * 10 % 11) % 10

        # Cálculo do segundo dígito verificador
        soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
        digito2 = (soma * 10 % 11) % 10

        # Verifica se os dígitos verificadores estão corretos
        return cpf[-2:] == f"{digito1}{digito2}"
    """
