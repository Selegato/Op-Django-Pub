from django.test import TestCase
from sharedForms.shared_forms import CpfForm

class CpfFormTest(TestCase):

    def test_cpf_com_pontos(self):
        form_data ={'cpf': '123.456.789-09'}
        form = CpfForm(data=form_data)
        self.assertTrue(form.is_valid())    
        
    def test_cpf_sem_pontos(self):
        form_data ={'cpf': '12345678909'}
        form = CpfForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_cpf_com_letras(self):
        form_data ={'cpf': '123.456.789-0a'}
        form = CpfForm(data=form_data)
        self.assertFalse(form.is_valid())

    def test_cpf_tamanho_incorreto_pra_menos(self):
        form_data ={'cpf': '123.456.789-0'}
        form = CpfForm(data=form_data)
        self.assertFalse(form.is_valid())

    def test_cpf_tamanho_incorreto_pra_mais(self):
        form_data ={'cpf': '123.456.789-098'}
        form = CpfForm(data=form_data)
        self.assertFalse(form.is_valid())

    def test_cpf_com_numeros_iguais(self):
        form_data ={'cpf': '111.111.111-11'}
        form = CpfForm(data=form_data)
        self.assertFalse(form.is_valid())