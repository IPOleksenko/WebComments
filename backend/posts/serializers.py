from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = "__all__"

    def get_replies(self, obj):
        children = Post.objects.filter(parent=obj).order_by("created_at")
        return PostSerializer(children, many=True).data