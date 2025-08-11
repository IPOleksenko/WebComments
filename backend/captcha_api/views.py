from rest_framework.views import APIView
from django.http import JsonResponse
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url

class CaptchaAPIView(APIView):
    def get(self, request):
        key = CaptchaStore.generate_key()
        relative_url = captcha_image_url(key)
        full_url = request.build_absolute_uri(relative_url)

        return JsonResponse({
            "captcha_key": key,
            "captcha_image_url": full_url,
        })
