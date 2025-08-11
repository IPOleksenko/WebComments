from django.http import JsonResponse
from rest_framework.views import APIView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCsrfTokenView(APIView):
    def get(self, request):
        return JsonResponse({"message": "CSRF cookie set"})