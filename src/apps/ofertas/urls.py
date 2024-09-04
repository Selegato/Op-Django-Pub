from django.urls import path
from apps.ofertas.views import ofertas, consulta_cpf_cognito, consulta_vitrine

urlpatterns = [
    path('ofertas/', ofertas, name='ofertas'),
    path('ofertas/consulta_cpf_cognito/', consulta_cpf_cognito, name='consulta-cpf-cognito'),
    path('ofertas/consulta_vitrine/', consulta_vitrine, name='consulta-vitrine'),
    
]