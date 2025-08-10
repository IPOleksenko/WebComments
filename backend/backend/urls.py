from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/csrf/', include('csrf.urls')),
    path('api/captcha/', include('captcha_api.urls')),
    path('captcha/', include('captcha.urls')),
    
    path('api/posts/', include('posts.urls')),

]