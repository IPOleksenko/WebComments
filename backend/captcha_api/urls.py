from django.urls import path
from .views import *

urlpatterns = [
    path("", CaptchaAPIView.as_view(), name="captcha"),
]
