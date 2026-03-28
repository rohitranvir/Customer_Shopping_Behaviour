from django.db import models
from django.conf import settings
from rooms.models import Room

class VersionHistory(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='versions')
    code_content = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='versions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Version of {self.room.name} by {self.created_by.username} at {self.created_at}"
