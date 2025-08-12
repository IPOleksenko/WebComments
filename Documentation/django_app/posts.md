# posts

## models.py

### class Post(models.Model)

**Purpose:**  
Stores information about a post or comment.

**Fields:**
- `username` — author's name.
- `email` — author's email.
- `homepage_url` — website link.
- `text_html` — content of the post.
- `parent` — reference to the parent post (for comments).
- `created_at` — creation date.
- `updated_at` — update date.

**Properties:**
- `is_comment` — returns `True` if the post is a comment.

---

### class FileForPost(models.Model)

**Purpose:**  
Stores files attached to posts.

**Fields:**
- `post` — related post.
- `file_base64` — file content in Base64.
- `filename` — file name.
- `content_type` — MIME type of the file.

---

## views.py

### class PostCreateView(APIView)

**Purpose:**  
Creates a new post or comment.

**Algorithm:**
1. Receives data from the request (`POST` + `FILES`).
2. Converts `parent_id` from `'null'` to `None`.
3. Formats the text (`format_preview()`).
4. Validates data via `PostFormWithCaptcha`.
5. If `parent_id` is provided, searches for the parent post.
6. Creates a `Post` object.
7. Processes each uploaded file via `handle_uploaded_file()`.
8. Saves files in `FileForPost`.
9. Returns JSON with the result.

---

### class PostListView(APIView)

**Purpose:**  
Returns a list of posts with pagination and sorting support.

**Algorithm:**
1. Reads parameters `page`, `limit`, `sort_by`, `sort_order`.
2. Forms `order_by`.
3. Selects posts without a parent (`parent=None`).
4. Applies pagination.
5. Serializes them via `PostSerializer`.
6. Returns JSON with posts and metadata.

---

## serializers.py

### class FileForPostSerializer(serializers.ModelSerializer)

**Purpose:**  
Serializes files for API transmission.

**Fields:** `filename`, `content_type`, `file_base64`.

---

### class PostSerializer(serializers.ModelSerializer)

**Purpose:**  
Serializes posts with nested replies and files.

**Fields:** all fields of the `Post` model plus:
- `replies` — list of replies.
- `files` — list of files attached to the post.

**Methods:**
- `get_replies()` — recursively serializes replies.
- `to_representation()` — adds debug print of serialized text.

---

## forms.py

### class PostFormWithCaptcha(forms.Form)

**Purpose:**  
Form for creating a post or comment with captcha verification and data validation.

**Fields:**
- `username` — string, required, max 150 characters.
- `email` — email address, required.
- `homepage_url` — optional URL.
- `text_html` — post text in HTML, required.
- `captcha` — captcha verification.

**Validation:**
- `clean_username()` — allows only Latin letters and numbers.
- `clean_homepage_url()` — checks URL format.
- `clean_text_html()` — replaces line breaks with `<br>`, sanitizes HTML using bleach, allowing tags `a`, `code`, `i`, `strong`, and `br`, and only attributes `href` and `title` for links.

---

## utils.py

### Functions

- `to_base64(file)` — converts a file to Base64.
- `process_image(image)` — checks image format, resizes if necessary, converts to RGB and Base64.
- `validate_text_file(file)` — checks the size and format of `.txt` files, converts to Base64.
- `handle_uploaded_file(file)` — routes file processing depending on its type, disallows unsupported types.

---

## urls.py

Routes:
- `path("api/posts/create/", PostCreateView.as_view(), name="post-create")` — create a post.
- `path("api/posts/get/", PostListView.as_view(), name="post-list")` — get list of posts.
