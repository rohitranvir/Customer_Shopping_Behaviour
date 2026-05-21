"""
accounts/serializers.py
"""

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Vendor


# ─────────────────────────────────────────────────────────────────────────────
# Output serializer  (password field deliberately excluded)
# ─────────────────────────────────────────────────────────────────────────────

class VendorSerializer(serializers.ModelSerializer):
    """
    Read-only serializer used in API responses.
    The `password` field is NEVER included.
    """

    class Meta:
        model = Vendor
        fields = [
            "id",
            "name",
            "owner_name",
            "phone",
            "email",
            "category",
            "city",
            "state",
            "description",
            "upi_id",
            "is_open",
            "photo_url",
            "latitude",
            "longitude",
            "created_at",
        ]
        read_only_fields = fields


# ─────────────────────────────────────────────────────────────────────────────
# Register serializer
# ─────────────────────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.Serializer):
    # Required
    name        = serializers.CharField(max_length=255)
    owner_name  = serializers.CharField(max_length=255)
    phone       = serializers.CharField(max_length=15)
    password    = serializers.CharField(write_only=True, min_length=6)

    # Optional
    email       = serializers.EmailField(required=False, allow_blank=True, default=None)
    category    = serializers.CharField(
        required=False,
        default="Food & Beverages",
    )
    city        = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    state       = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    description = serializers.CharField(max_length=500, required=False, allow_blank=True, default="")
    upi_id      = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    photo_url   = serializers.URLField(required=False, allow_blank=True, default="")
    latitude    = serializers.FloatField(required=False, allow_null=True, default=None)
    longitude   = serializers.FloatField(required=False, allow_null=True, default=None)

    # ── Validation ────────────────────────────────────────────────────────────

    def validate_phone(self, value):
        if Vendor.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A vendor with this phone number already exists.")
        return value

    def validate_email(self, value):
        # Treat empty string as None (nullable field)
        if not value:
            return None
        if Vendor.objects.filter(email=value).exists():
            raise serializers.ValidationError("A vendor with this email already exists.")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate_category(self, value):
        valid = [c[0] for c in Vendor.Category.choices]
        if value not in valid:
            raise serializers.ValidationError(
                f'"{value}" is not a valid category. '
                f"Valid choices: {valid}"
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        vendor = Vendor(**validated_data)
        vendor.set_password(password)
        vendor.save()
        return vendor


# ─────────────────────────────────────────────────────────────────────────────
# Login serializer
# ─────────────────────────────────────────────────────────────────────────────

class LoginSerializer(serializers.Serializer):
    phone    = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True)
