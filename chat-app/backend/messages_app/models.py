import uuid

from django.conf import settings
from django.db import models


class Message(models.Model):
    """A single chat message within a room."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(
        'rooms.Room',
        on_delete=models.CASCADE,
        related_name='messages',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
    )
    content = models.TextField(blank=True)
    file = models.FileField(upload_to='chat_files/', blank=True, null=True)
    file_type = models.CharField(max_length=50, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'{self.sender.username}: {self.content[:50]}'


class MessageReadReceipt(models.Model):
    """Tracks which users have read a specific message."""

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='receipts',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='read_receipts',
    )
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user')

    def __str__(self):
        return f'{self.user.username} read {self.message_id} at {self.read_at}'
