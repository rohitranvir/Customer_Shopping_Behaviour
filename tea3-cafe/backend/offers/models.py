from django.db import models

class Offer(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    discount_percent = models.IntegerField()
    valid_till = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
