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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        print(f"Serializing post {instance.id}: text_html = {repr(data.get('text_html'))}")
        return data

    def get_replies(self, obj):
        children = Post.objects.filter(parent=obj).order_by("created_at")
        return PostSerializer(children, many=True).data
