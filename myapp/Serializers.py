from mailbox import Message

from rest_framework import serializers
from .models import Blog, BlogReport

class BlogSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    report_count = serializers.SerializerMethodField()
    pinned = serializers.BooleanField(read_only=True)

    class Meta:
        model = Blog
        fields = ['id', 'title', 'content', 'author_name', 'author_id', 'created_at', 'report_count', 'pinned']

    def get_report_count(self, obj):
        return obj.reports.count()


class BlogReportSerializer(serializers.ModelSerializer):
    blog_title = serializers.CharField(source='blog.title', read_only=True)
    blog_author = serializers.CharField(source='blog.author.username', read_only=True)
    reported_by = serializers.CharField(source='reported_by.username', read_only=True)

    class Meta:
        model = BlogReport
        fields = ['id', 'blog', 'blog_title', 'blog_author', 'reported_by', 'reason', 'created_at']
        
class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    receiver_username = serializers.CharField(source="receiver.username", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "receiver",
            "sender_username",
            "receiver_username",
            "text",
            "created_at",
            "is_read",
        ]
        
class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    receiver_username = serializers.CharField(source="receiver.username", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "receiver",
            "sender_username",
            "receiver_username",
            "text",
            "created_at",
            "is_read",
        ]