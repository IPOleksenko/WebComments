# csrf_api

## class GetCsrfTokenView(APIView)

**Purpose:**  
Handles GET requests to set a CSRF cookie in the client's browser.  
Required for initializing CSRF protection when the frontend interacts with the server, ensuring that POST, PUT, and DELETE requests pass the security check.

**Methods:**
- `get(self, request)`  
  Returns a JSON response confirming that the CSRF cookie has been set.

**Workflow:**
1. The decorator `@method_decorator(ensure_csrf_cookie, name='dispatch')` forcibly adds a CSRF cookie to the response.
2. On a GET request, returns JSON with the key `"message"` and the value `"CSRF cookie set"`.
3. After this, the client can safely send requests that require a CSRF token.

**Routes:**
- `path('api/csrf/get/', GetCsrfTokenView.as_view(), name='csrf_token')`  
  Handles GET requests at `api/csrf/get/` and returns the CSRF cookie using the `GetCsrfTokenView` class.
