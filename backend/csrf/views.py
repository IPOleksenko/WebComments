from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCsrfTokenView(View):
    def get(self, request):
        return JsonResponse({"message": "CSRF cookie set"})