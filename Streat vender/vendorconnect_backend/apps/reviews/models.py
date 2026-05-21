"""
reviews/models.py

Public (no-auth) reviews for a Vendor.
Reviewers identify themselves by name only — no auth required.
"""

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Review(models.Model):
    """
    A customer review left on a vendor's profile.
    No authentication required — customer_name is a free-text field.
    """

    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_reviews",
    )

    # ── Review content ────────────────────────────────────────────────────────
    customer_name = models.CharField(max_length=100, blank=True, default="Anonymous")
    rating        = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comment       = models.TextField(blank=True, default="")

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_name} → {self.vendor.name} ({self.rating}★)"

    class Meta:
        db_table = "reviews_review"
        ordering = ["-created_at"]
