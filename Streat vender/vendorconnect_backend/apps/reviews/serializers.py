"""
reviews/serializers.py
"""

from rest_framework import serializers

from .models import Review


# ─────────────────────────────────────────────────────────────────────────────
# Output serializer
# ─────────────────────────────────────────────────────────────────────────────

class ReviewSerializer(serializers.ModelSerializer):
    """Full representation returned in API responses."""

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
# Create serializer  (POST /api/vendors/:vendor_id/reviews)
# ─────────────────────────────────────────────────────────────────────────────

class ReviewCreateSerializer(serializers.Serializer):
    """
    Validates incoming review payload.
    All three error cases produce the exact messages the spec requires:
      1. rating missing      → 400  "rating: This field is required."
      2. rating not a number → 400  "rating: A valid integer is required."
      3. rating < 1 or > 5  → 400  "rating: Rating must be between 1 and 5."

    Implementation note:
      We use a raw CharField for `rating` instead of IntegerField because DRF
      automatically injects MinValueValidator/MaxValueValidator from the model
      into IntegerField, which would produce generic "invalid" codes before our
      validate_rating() runs — making the error messages indistinguishable.
      By parsing the value ourselves we own every error code and message.
    """

    customer_name = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        default="Anonymous",
    )
    # Raw field — we cast to int and validate range manually below
    rating  = serializers.CharField()
    comment = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_rating(self, value: str) -> int:
        # Case 2: non-numeric string (e.g. "great", "five")
        try:
            int_value = int(value)
        except (ValueError, TypeError):
            raise serializers.ValidationError(
                "A valid integer is required.",
                code="invalid",
            )

        # Case 3: out-of-range integer
        if int_value < 1 or int_value > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5.",
                code="range",
            )

        return int_value

    def create(self, validated_data: dict) -> Review:
        """vendor is injected by the view via save(vendor=...)."""
        customer_name = validated_data.get("customer_name") or "Anonymous"
        return Review.objects.create(
            vendor=validated_data["vendor"],
            customer_name=customer_name,
            rating=validated_data["rating"],
            comment=validated_data.get("comment", ""),
        )
