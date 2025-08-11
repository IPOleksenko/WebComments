import re
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
        
        # Debug: Print the raw text_html to see if newlines are preserved
        raw_text = request.POST.get('text_html', '')
        print(f"Raw text_html from request: {repr(raw_text)}")
        
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

        # Format the text_html before saving it to the database
        formatted_text = self.format_preview(cleaned_data['text_html'])
        cleaned_data['text_html'] = formatted_text

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
        print(f"Text being saved to database: {repr(cleaned_data['text_html'])}")
        post = Post.objects.create(
            username=cleaned_data["username"],
            email=cleaned_data["email"],
            homepage_url=cleaned_data.get("homepage_url") or None,
            text_html=cleaned_data["text_html"],
            parent=parent
        )
        print(f"Text saved in database: {repr(post.text_html)}")

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

    def format_preview(self, text):
        # Replace all \n with <br>
        formatted_text = text.replace("\n", "<br>")

        # Remove all tags except <a>, <i>, <strong>, <code>, <br>
        formatted_text = re.sub(r"<(?!\/?(a|code|i|strong|br)(\s[^>]*|)\/?>)[^>]+>", "", formatted_text)

        # Remove all attributes from tags except <a>, keep only href and title in <a>
        formatted_text = re.sub(r'<(?!a\s)(\w+)([^>]*?)>', r'<\1>', formatted_text)  # Remove attributes from all tags except <a>
        formatted_text = re.sub(r'<a([^>]*?)(?!\s(?:href|title)[^>]*)(\s[^>]*?)?>', r'<a\1>', formatted_text)  # Remove attributes except href and title from <a>

        return formatted_text


class PostListView(APIView):
    def get(self, request):
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 25))
        
        # Get sorting parameters
        sort_by = request.GET.get('sort_by', 'id')
        sort_order = request.GET.get('sort_order', 'desc')

        # Build the order_by clause
        if sort_order == 'asc':
            order_by = sort_by
        else:
            order_by = f'-{sort_by}'

        posts = Post.objects.filter(parent=None).order_by(order_by)
        paginator = Paginator(posts, limit)
        paginated_posts = paginator.get_page(page)

        # Serialize the paginated posts
        serializer = PostSerializer(paginated_posts, many=True)

        return JsonResponse({
            "posts": serializer.data,
            "totalPages": paginator.num_pages,
            "sort_by": sort_by,
            "sort_order": sort_order,
        }, status=200)
