from django.contrib import admin
from .models import GalleryImage

@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_active', 'uploaded_at']
    list_filter = ['category', 'is_active']
    list_editable = ['is_active']
