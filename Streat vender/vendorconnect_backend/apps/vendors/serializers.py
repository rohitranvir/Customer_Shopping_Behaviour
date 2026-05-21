"""
vendors/serializers.py
"""

from django.db.models import Avg
from rest_framework import serializers

from apps.accounts.models import Vendor
from apps.menu.models import MenuItem
from apps.reviews.models import Review


# ─────────────────────────────────────────────────────────────────────────────
# MenuItem (embedded in vendor detail)
# ─────────────────────────────────────────────────────────────────────────────

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MenuItem
        fields = [
            "id",
            "name",
            "price",
            "is_available",
            "photo_url",
            "created_at",
        ]


# ─────────────────────────────────────────────────────────────────────────────
# Review (embedded in vendor detail)
# ─────────────────────────────────────────────────────────────────────────────

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Review
        fields = [
            "id",
            "customer_name",
            "rating",
            "comment",
            "created_at",
        ]


# ─────────────────────────────────────────────────────────────────────────────
# Vendor list serializer  (lightweight — no nested data)
# ─────────────────────────────────────────────────────────────────────────────

class VendorListSerializer(serializers.ModelSerializer):
    avg_rating    = serializers.SerializerMethodField()
    review_count  = serializers.SerializerMethodField()

    class Meta:
        model  = Vendor
        fields = [
            "id",
            "name",
            "owner_name",
            "phone",
            "category",
            "city",
            "state",
            "description",
            "is_open",
            "photo_url",
            "latitude",
            "longitude",
            "avg_rating",
            "review_count",
            "created_at",
        ]

    def get_avg_rating(self, obj) -> float | None:
        result = obj.received_reviews.aggregate(avg=Avg("rating"))["avg"]
        return round(result, 1) if result is not None else None

    def get_review_count(self, obj) -> int:
        return obj.received_reviews.count()


# ─────────────────────────────────────────────────────────────────────────────
# Vendor detail serializer  (full — includes menu + reviews + stats)
# ─────────────────────────────────────────────────────────────────────────────

class VendorDetailSerializer(VendorListSerializer):
    menu_items = MenuItemSerializer(many=True, read_only=True)
    reviews    = ReviewSerializer(source="received_reviews", many=True, read_only=True)

    class Meta(VendorListSerializer.Meta):
        fields = VendorListSerializer.Meta.fields + ["email", "upi_id", "menu_items", "reviews"]


# ─────────────────────────────────────────────────────────────────────────────
# Vendor partial-update serializer  (PUT /api/vendors/profile)
# ─────────────────────────────────────────────────────────────────────────────

class VendorUpdateSerializer(serializers.ModelSerializer):
    """
    Allows partial updates to non-sensitive vendor fields.
    Phone, password, and auth-internal fields are intentionally excluded.
    """

    class Meta:
        model  = Vendor
        fields = [
            "name",
            "owner_name",
            "category",
            "city",
            "state",
            "description",
            "upi_id",
            "email",
            "is_open",
            "latitude",
            "longitude",
        ]

    def validate_email(self, value):
        """Email must be globally unique (excluding the current vendor)."""
        if not value:
            return None
        qs = Vendor.objects.filter(email=value).exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This email is already in use by another vendor.")
        return value

    def validate_description(self, value):
        if len(value) > 500:
            raise serializers.ValidationError("Description cannot exceed 500 characters.")
        return value
