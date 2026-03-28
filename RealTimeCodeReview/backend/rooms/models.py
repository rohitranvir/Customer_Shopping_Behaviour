from django.db import models
from django.conf import settings
import uuid

class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_rooms')

    def __str__(self):
        return self.name

class RoomMember(models.Model):
    ROLE_CHOICES = (
        ('AUTHOR', 'Author'),
        ('REVIEWER', 'Reviewer'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='room_memberships')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='members')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='REVIEWER')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'room')

    def __str__(self):
        return f"{self.user.username} - {self.room.name} ({self.role})"

class CodeSnippet(models.Model):
    room = models.OneToOneField(Room, on_delete=models.CASCADE, related_name='code_snippet')
    content = models.TextField(blank=True, default="")
    language = models.CharField(max_length=50, default="javascript")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Snippet for Room: {self.room.name}"
