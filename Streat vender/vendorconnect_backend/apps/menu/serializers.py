"""
menu/serializers.py
"""

from decimal import Decimal

from rest_framework import serializers

from .models import MenuItem


# ─────────────────────────────────────────────────────────────────────────────
# Read serializer  (used in list & detail responses)
# ─────────────────────────────────────────────────────────────────────────────

class MenuItemSerializer(serializers.ModelSerializer):
    """Full representation returned in API responses."""

    vendor_id   = serializers.IntegerField(source="vendor.id",   read_only=True)
    vendor_name = serializers.CharField(source="vendor.name",    read_only=True)

    class Meta:
        model  = MenuItem
        fields = [
            "id",
            "vendor_id",
            "vendor_name",
            "name",
            "price",
            "is_available",
            "photo_url",
            "created_at",
            "updated_at",
        ]


# ─────────────────────────────────────────────────────────────────────────────
# Create serializer  (POST /api/menu)
# ─────────────────────────────────────────────────────────────────────────────

class MenuItemCreateSerializer(serializers.Serializer):
    """
    Accepts multipart/form-data or JSON.
    'photo' is an optional image file — handled separately in the view
    (uploaded to Cloudinary); the resulting URL is stored in photo_url.
    """

    name         = serializers.CharField(max_length=255)
    price        = serializers.DecimalField(max_digits=8, decimal_places=2)
    is_available = serializers.BooleanField(default=True, required=False)
    photo_url    = serializers.URLField(required=False, allow_blank=True, default="")

    def validate_price(self, value: Decimal) -> Decimal:
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def create(self, validated_data: dict) -> MenuItem:
        """vendor is injected by the view via save(vendor=...)."""
        return MenuItem.objects.create(**validated_data)


# ─────────────────────────────────────────────────────────────────────────────
# Update serializer  (PUT /api/menu/:item_id)
# ─────────────────────────────────────────────────────────────────────────────

class MenuItemUpdateSerializer(serializers.ModelSerializer):
    """
    All fields optional — partial update semantics.
    vendor is never updatable through this serializer.
    """

    class Meta:
        model   = MenuItem
        fields  = ["name", "price", "is_available", "photo_url"]

    def validate_price(self, value: Decimal) -> Decimal:
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value
