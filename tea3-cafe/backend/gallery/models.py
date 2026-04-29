from django.db import models

class GalleryImage(models.Model):
    CATEGORY_CHOICES = [
        ('food','Food'),
        ('coffee','Coffee'),
        ('ambience','Ambience'),
        ('events','Events')
    ]
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to='gallery/')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    is_active = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
