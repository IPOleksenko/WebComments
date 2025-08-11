from rest_framework import serializers
from .models import Post, FileForPost

class FileForPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileForPost
        fields = ['filename', 'content_type', 'file_base64']

class PostSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    files = FileForPostSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = "__all__"

    def get_replies(self, obj):
        children = Post.objects.filter(parent=obj).order_by("created_at")
        return PostSerializer(children, many=True).data
