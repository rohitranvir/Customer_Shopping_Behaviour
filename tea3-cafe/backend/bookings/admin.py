from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['name', 'date', 'time', 'guests', 'status', 'phone']
    list_filter = ['status', 'date']
    list_editable = ['status']
    ordering = ['-created_at']
