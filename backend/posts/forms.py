from django import forms
from captcha.fields import CaptchaField
import bleach
import re
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

allowed_tags = ["a", "code", "i", "strong"]
allowed_attrs = {
    "a": ["href", "title"],
}
url_validator = URLValidator()

class PostFormWithCaptcha(forms.Form):
    username = forms.CharField(max_length=150)
    email = forms.EmailField()
    homepage_url = forms.URLField(required=False)
    text_html = forms.CharField(widget=forms.Textarea)
    captcha = CaptchaField()

    def clean_username(self):
        username = self.cleaned_data["username"]
        if not re.fullmatch(r"[A-Za-z0-9]+", username):
            raise forms.ValidationError("username must contain only latin letters and digits")
        return username

    def clean_homepage_url(self):
        url = self.cleaned_data.get("homepage_url")
        if url:
            try:
                url_validator(url)
            except ValidationError:
                raise forms.ValidationError("invalid homepage_url format")
        return url

    def clean_text_html(self):
        text = self.cleaned_data["text_html"]
        
        # Preserve newlines and spacing by converting them to <br> tags
        # Handle multiple consecutive newlines properly
        import re
        
        # Convert multiple consecutive newlines to preserve paragraph breaks
        # Two or more newlines should create more spacing
        text = re.sub(r'\n{3,}', '<br><br><br>', text)  # 3+ newlines become 3 br tags
        text = re.sub(r'\n\n', '<br><br>', text)  # 2 newlines become 2 br tags
        text = text.replace('\n', '<br>')  # Single newlines become single br tags
        
        # Clean the HTML with bleach, allowing br tags and our allowed tags
        cleaned = bleach.clean(text, tags=allowed_tags + ['br'], attributes=allowed_attrs, strip=True)
        print(f"Text after cleaning: {repr(cleaned)}")
        return cleaned
