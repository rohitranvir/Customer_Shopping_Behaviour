from django.db import models
from django.conf import settings
from rooms.models import Room

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='comments')
    line_number = models.IntegerField(null=True, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} in {self.room.name}"
