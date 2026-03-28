from rest_framework import serializers
from .models import Room, RoomMember, CodeSnippet
from accounts.serializers import UserSerializer

class CodeSnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeSnippet
        fields = ['content', 'language', 'updated_at']

class RoomMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = RoomMember
        fields = ['user', 'role', 'joined_at']

class RoomSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = RoomMemberSerializer(many=True, read_only=True)
    code_snippet = CodeSnippetSerializer(read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'name', 'created_at', 'created_by', 'members', 'code_snippet']
