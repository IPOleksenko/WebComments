import json
from django.views import View
from django.http import JsonResponse
from django.core.validators import validate_email, URLValidator
from django.core.exceptions import ValidationError
from .models import Post
from .forms import PostFormWithCaptcha

validator = URLValidator()

class PostCreateView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)

        form = PostFormWithCaptcha(data)

        if not form.is_valid():
            errors = []
            for field_errors in form.errors.values():
                errors.extend(field_errors)
            return JsonResponse({"error": errors}, status=400)

        cleaned_data = form.cleaned_data
        post = Post.objects.create(
            username=cleaned_data["username"],
            email=cleaned_data["email"],
            homepage_url=cleaned_data.get("homepage_url") or None,
            text_html=cleaned_data["text_html"]
        )

        return JsonResponse({"message": "Post created successfully.", "post_id": post.id}, status=201)
