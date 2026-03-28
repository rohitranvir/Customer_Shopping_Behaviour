from django.contrib import admin

from .models import Room


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    """Admin configuration for the Room model."""

    list_display = ('name', 'room_type', 'created_by', 'created_at')
    list_filter = ('room_type', 'created_at')
    search_fields = ('name', 'description')
    filter_horizontal = ('members',)
