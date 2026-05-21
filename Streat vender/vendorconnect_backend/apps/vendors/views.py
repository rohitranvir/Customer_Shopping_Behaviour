"""
vendors/views.py

GET  /api/vendors/                — public list with filters
GET  /api/vendors/<id>/           — public detail (vendor + menu + reviews + stats)
PUT  /api/vendors/profile/        — protected, partial update own profile
POST /api/vendors/profile/photo/  — protected, upload photo to Cloudinary
"""

from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    parser_classes,
    permission_classes,
)
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import Vendor
from apps.utils.authentication import VendorJWTAuthentication
from apps.utils.cloudinary_upload import upload_vendor_photo

from .serializers import (
    VendorDetailSerializer,
    VendorListSerializer,
    VendorUpdateSerializer,
)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _ok(data, http_status=status.HTTP_200_OK) -> Response:
    return Response({"success": True, "data": data}, status=http_status)


def _err(message: str, http_status=status.HTTP_400_BAD_REQUEST) -> Response:
    return Response({"success": False, "error": message}, status=http_status)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/vendors/
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def vendor_list(request):
    """
    Public.  Returns a list of active vendor accounts.

    Query parameters (all optional, combinable):
      ?category=food          exact match (case-sensitive choices)
      ?city=Mumbai            case-insensitive partial match
      ?is_open=true           boolean filter
      ?search=biryani         icontains against name + description
    """
    qs = Vendor.objects.filter(is_active=True).order_by("-created_at")

    # ── category filter ───────────────────────────────────────────────────────
    category = request.query_params.get("category", "").strip()
    if category:
        qs = qs.filter(category__iexact=category)

    # ── city filter (partial, case-insensitive) ───────────────────────────────
    city = request.query_params.get("city", "").strip()
    if city:
        qs = qs.filter(city__icontains=city)

    # ── is_open filter ────────────────────────────────────────────────────────
    is_open_param = request.query_params.get("is_open", "").strip().lower()
    if is_open_param in ("true", "1", "yes"):
        qs = qs.filter(is_open=True)
    elif is_open_param in ("false", "0", "no"):
        qs = qs.filter(is_open=False)

    # ── full-text search across name + description ────────────────────────────
    search = request.query_params.get("search", "").strip()
    if search:
        qs = qs.filter(
            Q(name__icontains=search) | Q(description__icontains=search)
        )

    serializer = VendorListSerializer(qs, many=True)
    return _ok({"vendors": serializer.data, "count": qs.count()})


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/vendors/<id>/
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def vendor_detail(request, pk: int):
    """
    Public.  Returns full vendor profile including:
      - All base fields
      - menu_items  (related_name on MenuItem.vendor)
      - reviews     (received_reviews)
      - avg_rating, review_count
    """
    try:
        vendor = Vendor.objects.get(pk=pk, is_active=True)
    except Vendor.DoesNotExist:
        return _err("Vendor not found.", status.HTTP_404_NOT_FOUND)

    serializer = VendorDetailSerializer(vendor)
    return _ok({"vendor": serializer.data})


# ─────────────────────────────────────────────────────────────────────────────
# PUT /api/vendors/profile/
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["PUT"])
@authentication_classes([VendorJWTAuthentication])
@permission_classes([IsAuthenticated])
def vendor_update_profile(request):
    """
    Protected.  Partially update the authenticated vendor's own profile.
    Does NOT allow changing phone or password through this endpoint.
    """
    serializer = VendorUpdateSerializer(
        request.user,
        data=request.data,
        partial=True,      # all fields optional — PATCH-style behaviour via PUT
    )

    if not serializer.is_valid():
        first_field = next(iter(serializer.errors))
        first_msg   = serializer.errors[first_field][0]
        return _err(f"{first_field}: {first_msg}")

    vendor = serializer.save()
    return _ok({"vendor": VendorDetailSerializer(vendor).data})


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/vendors/profile/photo/
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@authentication_classes([VendorJWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def vendor_upload_photo(request):
    """
    Protected.  Accepts multipart/form-data with field "photo".
    Uploads the image to Cloudinary and saves the URL to vendor.photo_url.

    Validations (in cloudinary_upload helper):
      - Allowed types: jpeg, png, webp, gif
      - Max size: 5 MB
    """
    photo_file = request.FILES.get("photo")

    if not photo_file:
        return _err("No file uploaded. Send a file under the field name 'photo'.")

    try:
        secure_url = upload_vendor_photo(photo_file, vendor_id=request.user.pk)
    except Exception as exc:
        # Catches both our ValidationError and any Cloudinary SDK errors
        message = str(exc)
        # ValidationError from DRF wraps the message in a list
        if hasattr(exc, "detail"):
            detail = exc.detail
            message = detail[0] if isinstance(detail, list) else str(detail)
        return _err(message)

    # Persist the new URL
    request.user.photo_url = secure_url
    request.user.save(update_fields=["photo_url"])

    return _ok(
        {
            "photo_url": secure_url,
            "message": "Photo uploaded successfully.",
        }
    )
