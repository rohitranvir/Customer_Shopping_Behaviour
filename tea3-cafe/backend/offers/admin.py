from django.contrib import admin
from .models import Offer

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'discount_percent', 'valid_till', 'is_active']
    list_filter = ['is_active']
    list_editable = ['is_active', 'valid_till']
