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
        cleaned = bleach.clean(text, tags=allowed_tags, attributes=allowed_attrs, strip=True)
        return cleaned
