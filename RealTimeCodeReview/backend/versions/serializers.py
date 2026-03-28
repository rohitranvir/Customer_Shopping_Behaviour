from rest_framework import serializers
from .models import VersionHistory
from accounts.serializers import UserSerializer

class VersionHistorySerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    class Meta:
        model = VersionHistory
        fields = ['id', 'room', 'code_content', 'created_by', 'created_at']
