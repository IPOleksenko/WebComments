from django.db import models


class Post(models.Model):
    username = models.CharField(max_length=18, null=False, blank=False)
    email = models.EmailField(max_length=254)
    homepage_url = models.URLField(max_length=200, blank=True, null=True)
    text_html = models.TextField()

    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username}: {self.text_html[:30]}"

    @property
    def is_comment(self):
        return self.parent is not None

class FileForPost(models.Model):
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name='files')
    file_base64 = models.TextField(blank=True, null=True)
    filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)

    def __str__(self):
        return f"File for {self.post.username}: {self.filename}"
