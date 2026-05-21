"""
utils/cloudinary_upload.py

Single-responsibility helper for uploading files to Cloudinary.
Used by the vendor photo endpoint (POST /api/vendors/profile/photo).
"""

import os

import cloudinary
import cloudinary.uploader
from rest_framework.exceptions import ValidationError

# ── Allowed MIME types ────────────────────────────────────────────────────────
_ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
}

# ── 5 MB in bytes ─────────────────────────────────────────────────────────────
_MAX_SIZE_BYTES = 5 * 1024 * 1024


def _configure_cloudinary() -> None:
    """
    Lazily configure the Cloudinary SDK from environment variables.
    django-cloudinary-storage sets these automatically, but calling
    cloudinary.uploader.upload() directly needs them to be set first.
    """
    cloudinary.config(
        cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", ""),
        api_key=os.environ.get("CLOUDINARY_API_KEY", ""),
        api_secret=os.environ.get("CLOUDINARY_API_SECRET", ""),
        secure=True,
    )


def upload_vendor_photo(file, vendor_id: int) -> str:
    """
    Validate and upload an image file to Cloudinary.

    Args:
        file:       InMemoryUploadedFile or TemporaryUploadedFile from request.FILES
        vendor_id:  Used as part of the public_id for easy management

    Returns:
        str: The secure HTTPS URL of the uploaded image.

    Raises:
        rest_framework.exceptions.ValidationError  on bad file type or size.
        Exception (from cloudinary SDK)            on upload failure — let views catch it.
    """
    # ── Guard: content type ───────────────────────────────────────────────────
    content_type = getattr(file, "content_type", "").lower()
    if content_type not in _ALLOWED_CONTENT_TYPES:
        raise ValidationError(
            f"Unsupported file type '{content_type}'. "
            f"Allowed types: jpeg, png, webp, gif."
        )

    # ── Guard: file size ──────────────────────────────────────────────────────
    if file.size > _MAX_SIZE_BYTES:
        size_mb = file.size / (1024 * 1024)
        raise ValidationError(
            f"File too large ({size_mb:.1f} MB). Maximum allowed size is 5 MB."
        )

    _configure_cloudinary()

    result = cloudinary.uploader.upload(
        file,
        folder="vendorconnect/vendor_photos",
        public_id=f"vendor_{vendor_id}",
        overwrite=True,                 # replace existing photo for same vendor
        resource_type="image",
        allowed_formats=["jpg", "jpeg", "png", "webp", "gif"],
        transformation=[
            {"width": 800, "height": 800, "crop": "limit"},   # cap dimensions
            {"quality": "auto:good"},                          # auto compression
            {"fetch_format": "auto"},                          # serve webp to browsers
        ],
    )

    return result["secure_url"]
