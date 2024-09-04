from django.urls import path
from apps.beneficios.views import beneficios, consulta_beneficios, baixar_beneficios

urlpatterns = [
    path('beneficios/', beneficios, name='beneficios'),
    path('beneficios/consulta_beneficios/', consulta_beneficios, name='consulta-beneficios'),
    path('beneficios/baixar_beneficios/', baixar_beneficios, name='baixar_beneficios'),
    
]