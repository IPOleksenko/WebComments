from django.urls import path
from .views import *

urlpatterns = [
    path("create/", PostCreateView.as_view(), name="post-create"),
    path("get/", PostListView.as_view(), name="post-list"),
]
