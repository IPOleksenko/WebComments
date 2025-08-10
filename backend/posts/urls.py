from django.urls import path
from .views import *

urlpatterns = [
    path("create/", PostCreateView.as_view(), name="post-create"),
]
