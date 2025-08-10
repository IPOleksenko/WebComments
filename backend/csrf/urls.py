from django.urls import path
from .views import GetCsrfTokenView

urlpatterns = [
    path('get/', GetCsrfTokenView.as_view(), name='csrf_token'),
]