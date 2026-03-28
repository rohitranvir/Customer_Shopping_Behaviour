import uuid

from django.conf import settings
from django.db import models


class Room(models.Model):
    """Chat room that users can join and send messages in."""

    ROOM_TYPE_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    room_type = models.CharField(
        max_length=10,
        choices=ROOM_TYPE_CHOICES,
        default='public',
    )
    password = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_rooms',
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='joined_rooms',
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
