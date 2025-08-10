from django.views import View
from django.http import JsonResponse
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from django.conf import settings

class CaptchaAPIView(View):
    def get(self, request):
        key = CaptchaStore.generate_key()
        relative_url = captcha_image_url(key)
        full_url = request.build_absolute_uri(relative_url)

        return JsonResponse({
            "captcha_key": key,
            "captcha_image_url": full_url,
        })
