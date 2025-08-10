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
