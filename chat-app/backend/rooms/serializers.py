from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    """Serializer for the Room model with nested user data."""

    created_by = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Room
        fields = [
            'id',
            'name',
            'description',
            'room_type',
            'password',
            'created_by',
            'members',
            'created_at',
            'member_count',
        ]

    def get_member_count(self, obj):
        return obj.members.count()
