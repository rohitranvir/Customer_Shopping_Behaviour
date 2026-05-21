"""
accounts/models.py
Vendor model — AbstractBaseUser with phone as the USERNAME_FIELD.
"""

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import MaxLengthValidator
from django.db import models


# ─────────────────────────────────────────────────────────────────────────────
# Manager
# ─────────────────────────────────────────────────────────────────────────────

class VendorManager(BaseUserManager):
    """Custom manager where phone is the unique identifier for auth."""

    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("Phone number is required.")
        vendor = self.model(phone=phone, **extra_fields)
        vendor.set_password(password)
        vendor.save(using=self._db)
        return vendor

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(phone, password, **extra_fields)


# ─────────────────────────────────────────────────────────────────────────────
# Vendor model
# ─────────────────────────────────────────────────────────────────────────────

class Vendor(AbstractBaseUser, PermissionsMixin):
    """
    Primary auth model for VendorConnect India.
    Phone is used as the login credential (USERNAME_FIELD).
    """

    class Category(models.TextChoices):
        # Values are identical to labels so the frontend string is stored as-is.
        FOOD_AND_BEVERAGES      = "Food & Beverages",      "Food & Beverages"
        FRESH_VEGETABLES        = "Fresh Vegetables",      "Fresh Vegetables"
        AGRICULTURE_AND_GRAINS  = "Agriculture & Grains",  "Agriculture & Grains"
        CLOTHES_AND_TEXTILES    = "Clothes & Textiles",    "Clothes & Textiles"
        ELECTRONICS_AND_MOBILE  = "Electronics & Mobile",  "Electronics & Mobile"
        HOME_AND_KITCHEN        = "Home & Kitchen",        "Home & Kitchen"
        BEAUTY_AND_PERSONAL     = "Beauty & Personal Care","Beauty & Personal Care"
        BOOKS_AND_STATIONERY    = "Books & Stationery",    "Books & Stationery"
        TOYS_AND_GAMES          = "Toys & Games",          "Toys & Games"
        JEWELLERY               = "Jewellery & Accessories","Jewellery & Accessories"
        HARDWARE_AND_TOOLS      = "Hardware & Tools",      "Hardware & Tools"
        HERBS_AND_AYURVEDA      = "Herbs & Ayurveda",      "Herbs & Ayurveda"
        DAIRY_PRODUCTS          = "Dairy Products",        "Dairy Products"
        BAKERY_AND_SWEETS       = "Bakery & Sweets",       "Bakery & Sweets"
        ART_AND_HANDICRAFTS     = "Art & Handicrafts",     "Art & Handicrafts"
        GENERAL_STORE           = "General Store",         "General Store"
        AUTO_PARTS              = "Auto Parts",            "Auto Parts"
        FLOWERS_AND_PLANTS      = "Flowers & Plants",      "Flowers & Plants"
        FOOTWEAR                = "Footwear",              "Footwear"
        MUSIC_AND_INSTRUMENTS   = "Music & Instruments",   "Music & Instruments"

    # ── Identity ─────────────────────────────────────────────────────────────
    name        = models.CharField(max_length=255)               # stall name
    owner_name  = models.CharField(max_length=255)
    phone       = models.CharField(max_length=15, unique=True)   # login username
    email       = models.EmailField(unique=True, null=True, blank=True)

    # ── Business Details ─────────────────────────────────────────────────────
    category    = models.CharField(
        max_length=50,                          # longest value = "Jewellery & Accessories" (23) — safe margin
        choices=Category.choices,
        default=Category.FOOD_AND_BEVERAGES,
    )
    city        = models.CharField(max_length=100, blank=True, default="")
    state       = models.CharField(max_length=100, blank=True, default="")
    description = models.TextField(
        blank=True,
        default="",
        validators=[MaxLengthValidator(500)],
    )
    upi_id      = models.CharField(max_length=100, blank=True, default="")

    # ── Status & Media ───────────────────────────────────────────────────────
    is_open     = models.BooleanField(default=True)
    photo_url   = models.URLField(blank=True, default="")

    # ── Location ─────────────────────────────────────────────────────────────
    latitude    = models.FloatField(null=True, blank=True)
    longitude   = models.FloatField(null=True, blank=True)

    # ── Django internals (required by AbstractBaseUser + PermissionsMixin) ───
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)   # Django admin access
    created_at  = models.DateTimeField(auto_now_add=True)

    objects = VendorManager()

    USERNAME_FIELD  = "phone"
    REQUIRED_FIELDS = ["name", "owner_name"]   # used by createsuperuser

    class Meta:
        db_table = "accounts_vendor"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.phone})"
