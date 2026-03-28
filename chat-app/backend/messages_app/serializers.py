from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Message, MessageReadReceipt


class MessageReadReceiptSerializer(serializers.ModelSerializer):
    """Serializer for message read receipts."""

    class Meta:
        model = MessageReadReceipt
        fields = ['user', 'read_at']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages with nested sender and receipts."""

    sender = UserSerializer(read_only=True)
    receipts = MessageReadReceiptSerializer(many=True, read_only=True)
    room = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Message
        fields = [
            'id',
            'room',
            'sender',
            'content',
            'file',
            'file_type',
            'timestamp',
            'receipts',
        ]
