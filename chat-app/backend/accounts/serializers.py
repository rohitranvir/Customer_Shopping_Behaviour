from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the custom User model."""

    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'avatar',
            'bio',
            'is_online',
            'last_seen',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
