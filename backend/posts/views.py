from rest_framework.views import APIView
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from .models import Post, FileForPost
from .serializers import PostSerializer
from .forms import PostFormWithCaptcha
from .utils import handle_uploaded_file

class PostCreateView(APIView):
    def post(self, request):
        # Extract form data from request.POST
        form_data = request.POST.dict()
        
        # Extract files from request.FILES
        files = request.FILES.getlist('files')

        # Check for null in parent_id
        parent_id = form_data.get("parent_id")
        if parent_id == 'null':
            parent_id = None  # Convert 'null' string to None

        # Prepare cleaned data for form
        cleaned_data = {
            "username": form_data.get("username"),
            "email": form_data.get("email"),
            "homepage_url": form_data.get("homepage_url"),
            "text_html": form_data.get("text_html"),
            "captcha_0": form_data.get("captcha_0"),
            "captcha_1": form_data.get("captcha_1"),
            "parent_id": parent_id,
        }

        # Create the form instance
        form = PostFormWithCaptcha(cleaned_data)

        if not form.is_valid():
            errors = []
            for field_errors in form.errors.values():
                errors.extend(field_errors)
            return JsonResponse({"error": errors}, status=400)

        parent = None
        if parent_id:
            try:
                parent = Post.objects.get(id=parent_id)
            except Post.DoesNotExist:
                return JsonResponse({"error": f"Parent post with id={parent_id} not found."}, status=404)

        # Create the post
        post = Post.objects.create(
            username=cleaned_data["username"],
            email=cleaned_data["email"],
            homepage_url=cleaned_data.get("homepage_url") or None,
            text_html=cleaned_data["text_html"],
            parent=parent
        )

        # Handle files
        file_records = []
        for file in files:
            try:
                file_base64 = handle_uploaded_file(file)
                
                file_record = FileForPost.objects.create(
                    post=post,
                    file_base64=file_base64,
                    filename=file.name,
                    content_type=file.content_type
                )
                file_records.append(file_record)
            except ValidationError as e:
                return JsonResponse({"error": str(e)}, status=400)

        return JsonResponse({
            "message": "Post created successfully.",
            "post_id": post.id,
            "parent_id": parent.id if parent else None,
            "files": [{"filename": record.filename, "content_type": record.content_type} for record in file_records]
        }, status=201)


class PostListView(APIView):
    def get(self, request):
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 25))

        posts = Post.objects.filter(parent=None).order_by('-id')
        paginator = Paginator(posts, limit)
        paginated_posts = paginator.get_page(page)

        # Serialize the paginated posts
        serializer = PostSerializer(paginated_posts, many=True)

        return JsonResponse({
            "posts": serializer.data,
            "totalPages": paginator.num_pages,
        }, status=200)