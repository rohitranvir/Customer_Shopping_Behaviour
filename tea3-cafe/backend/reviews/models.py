from django.db import models

class Review(models.Model):
    name = models.CharField(max_length=200)
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.rating} Stars"
