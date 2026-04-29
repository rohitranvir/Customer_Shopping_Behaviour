from django.contrib import admin
from .models import MenuItem

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'is_popular', 'is_available']
    list_filter = ['category', 'is_popular', 'is_available']
    search_fields = ['name', 'description']
    list_editable = ['price', 'is_available', 'is_popular']
