
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class MenuItem(models.Model):
    """A single item on a vendor's menu."""

    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="menu_items",
    )

    # ── Core fields ───────────────────────────────────────────────────────────
    name        = models.CharField(max_length=255)
    price       = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
    )
    is_available = models.BooleanField(default=True)
    photo_url    = models.URLField(blank=True, default="")

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vendor.name} — {self.name}"

    class Meta:
        db_table = "menu_item"
        ordering = ["name"]
