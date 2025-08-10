from django.db import models

class Post(models.Model):
    username = models.CharField(max_length=18, null=False, blank=False)
    email = models.EmailField(max_length=254)
    homepage_url = models.URLField(max_length=200, blank=True, null=True)
    text_html = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
