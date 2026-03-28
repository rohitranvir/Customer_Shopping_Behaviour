from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model with additional profile fields."""

    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
