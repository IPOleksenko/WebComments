# captcha_api

## class CaptchaAPIView(APIView)

**Purpose:**  
Handles GET requests to generate a new captcha and return its key and image.

**Methods:**
- `get(self, request)`  
  Generates a new captcha, constructs the full image URL, and returns the data in JSON format.

**Workflow:**
1. Calls `CaptchaStore.generate_key()` to create a unique captcha key.
2. Retrieves the relative image URL using `captcha_image_url(key)`.
3. Converts the relative path to an absolute URL using `request.build_absolute_uri(...)`.
4. Returns a JSON response with the following fields:
   - `captcha_key` — string, the unique captcha key.
   - `captcha_image_url` — full URL to the captcha image.

**Routes:**
- `path("api/captcha/", CaptchaAPIView.as_view(), name="captcha")`  
  Handles GET requests at `api/captcha/` and returns data with the captcha key and image using the `CaptchaAPIView` class.
