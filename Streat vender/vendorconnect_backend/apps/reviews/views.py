"""
reviews/views.py

Both endpoints are nested under a vendor:

POST /api/vendors/<vendor_id>/reviews/  — public, create a review
GET  /api/vendors/<vendor_id>/reviews/  — public, list reviews + stats

Views are defined here and wired in vendors/urls.py for REST nesting.
"""

from django.db.models import Avg
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.models import Vendor

from .models import Review
from .serializers import ReviewCreateSerializer, ReviewSerializer


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _ok(data, http_status=status.HTTP_200_OK) -> Response:
    return Response({"success": True, "data": data}, status=http_status)


def _err(message: str, http_status=status.HTTP_400_BAD_REQUEST) -> Response:
    return Response({"success": False, "error": message}, status=http_status)


def _get_vendor_or_404(vendor_id: int):
    """Return (Vendor, None) or (None, error Response)."""
    try:
        return Vendor.objects.get(pk=vendor_id, is_active=True), None
    except Vendor.DoesNotExist:
        return None, _err("Vendor not found.", status.HTTP_404_NOT_FOUND)


# ─────────────────────────────────────────────────────────────────────────────
# POST + GET  /api/vendors/<vendor_id>/reviews/
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def vendor_reviews(request, vendor_id: int):
    """
    GET  — returns all reviews for the vendor + avg_rating + review_count.
    POST — creates a new review (no auth required).
    """
    vendor, err = _get_vendor_or_404(vendor_id)
    if err:
        return err

    if request.method == "POST":
        return _create_review(request, vendor)

    return _list_reviews(vendor)


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers — keep each action isolated
# ─────────────────────────────────────────────────────────────────────────────

def _create_review(request, vendor: Vendor) -> Response:
    """
    Validates payload and creates a Review.

    Explicit error cascade (matches spec):
      1. rating missing          → 400  "rating: This field is required."
      2. rating not a number     → 400  "rating: A valid integer is required."
      3. rating < 1 or > 5      → 400  "rating: Rating must be between 1 and 5."
    """
    serializer = ReviewCreateSerializer(data=request.data)

    if not serializer.is_valid():
        errors = serializer.errors

        # ── rating-specific error handling (spec requirement) ─────────────────
        if "rating" in errors:
            raw_msgs = errors["rating"]
            first    = raw_msgs[0] if raw_msgs else "Invalid rating."

            # DRF error code "required" → field was missing entirely
            if hasattr(first, "code") and first.code == "required":
                return _err("rating: This field is required.")

            # DRF error code "invalid" → non-numeric value submitted
            if hasattr(first, "code") and first.code == "invalid":
                return _err("rating: A valid integer is required.")

            # Our custom validator → range error
            return _err(f"rating: {first}")

        # Generic fallback for other fields
        first_field = next(iter(errors))
        first_msg   = errors[first_field][0]
        return _err(f"{first_field}: {first_msg}")

    review = serializer.save(vendor=vendor)
    return _ok({"review": ReviewSerializer(review).data}, status.HTTP_201_CREATED)


def _list_reviews(vendor: Vendor) -> Response:
    """Returns reviews + aggregate stats for the vendor."""
    reviews = Review.objects.filter(vendor=vendor).order_by("-created_at")

    agg        = reviews.aggregate(avg=Avg("rating"))
    avg_rating = round(agg["avg"], 1) if agg["avg"] is not None else None

    return _ok({
        "vendor_id":    vendor.pk,
        "vendor_name":  vendor.name,
        "avg_rating":   avg_rating,
        "review_count": reviews.count(),
        "reviews":      ReviewSerializer(reviews, many=True).data,
    })
