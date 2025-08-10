import json
from django.views import View
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from .models import Post
from .serializers import PostSerializer
from .forms import PostFormWithCaptcha


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

        parent = None
        parent_id = cleaned_data.get("parent_id") or data.get("parent_id")
        if parent_id:
            try:
                parent = Post.objects.get(id=parent_id)
            except Post.DoesNotExist:
                return JsonResponse({"error": f"Parent post with id={parent_id} not found."}, status=404)

        post = Post.objects.create(
            username=cleaned_data["username"],
            email=cleaned_data["email"],
            homepage_url=cleaned_data.get("homepage_url") or None,
            text_html=cleaned_data["text_html"],
            parent=parent
        )

        return JsonResponse({
            "message": "Post created successfully.",
            "post_id": post.id,
            "parent_id": parent.id if parent else None
        }, status=201)


class PostListView(View):
    def get(self, request):
        posts = Post.objects.filter(parent=None).order_by('-created_at')
        serializer = PostSerializer(posts, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)
