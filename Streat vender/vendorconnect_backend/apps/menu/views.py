"""
menu/views.py

POST   /api/menu/              protected — create item for authenticated vendor
PUT    /api/menu/<item_id>/    protected — partial update (owner only, 403 otherwise)
DELETE /api/menu/<item_id>/    protected — delete (owner only, 403 otherwise)

GET    /api/vendors/<vendor_id>/menu/   public — list all items for a vendor
  ↑ wired in vendors/urls.py, view defined here for clean co-location
"""

from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    parser_classes,
    permission_classes,
)
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import Vendor
from apps.utils.authentication import VendorJWTAuthentication
from apps.utils.cloudinary_upload import upload_vendor_photo

from .models import MenuItem
from .serializers import (
    MenuItemCreateSerializer,
    MenuItemSerializer,
    MenuItemUpdateSerializer,
)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _ok(data, http_status=status.HTTP_200_OK) -> Response:
    return Response({"success": True, "data": data}, status=http_status)


def _err(message: str, http_status=status.HTTP_400_BAD_REQUEST) -> Response:
    return Response({"success": False, "error": message}, status=http_status)


def _get_item_or_404(item_id: int):
    """Return (MenuItem, None) or (None, error Response)."""
    try:
        return MenuItem.objects.select_related("vendor").get(pk=item_id), None
    except MenuItem.DoesNotExist:
        return None, _err("Menu item not found.", status.HTTP_404_NOT_FOUND)


def _assert_owner(item: MenuItem, vendor: Vendor):
    """Return None if the vendor owns the item, else a 403 Response."""
    if item.vendor_id != vendor.pk:
        return _err(
            "You do not have permission to modify this menu item.",
            status.HTTP_403_FORBIDDEN,
        )
    return None


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/vendors/<vendor_id>/menu/   (public)
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def vendor_menu_list(request, vendor_id: int):
    """
    Public.  Returns all menu items (including unavailable) for the given vendor.
    Returns 404 if the vendor doesn't exist or is inactive.
    """
    try:
        vendor = Vendor.objects.get(pk=vendor_id, is_active=True)
    except Vendor.DoesNotExist:
        return _err("Vendor not found.", status.HTTP_404_NOT_FOUND)

    items = MenuItem.objects.filter(vendor=vendor).order_by("name")
    serializer = MenuItemSerializer(items, many=True)
    return _ok({"vendor_id": vendor_id, "items": serializer.data, "count": items.count()})


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/menu/   (protected)
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@authentication_classes([VendorJWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def menu_item_create(request):
    """
    Protected.  Creates a new MenuItem owned by the authenticated vendor.

    Accepts multipart/form-data (for photo upload) or JSON.
    Optional field: 'photo' (image file) → uploaded to Cloudinary → photo_url saved.
    """
    data = request.data.copy()

    # ── Optional Cloudinary photo upload ─────────────────────────────────────
    photo_file = request.FILES.get("photo")
    if photo_file:
        try:
            photo_url = upload_vendor_photo(photo_file, vendor_id=request.user.pk)
            data["photo_url"] = photo_url
        except Exception as exc:
            message = str(exc)
            if hasattr(exc, "detail"):
                detail = exc.detail
                message = detail[0] if isinstance(detail, list) else str(detail)
            return _err(message)

    serializer = MenuItemCreateSerializer(data=data)
    if not serializer.is_valid():
        first_field = next(iter(serializer.errors))
        first_msg   = serializer.errors[first_field][0]
        return _err(f"{first_field}: {first_msg}")

    item = serializer.save(vendor=request.user)
    return _ok({"item": MenuItemSerializer(item).data}, status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────────────────
# PUT /api/menu/<item_id>/   (protected, owner only)
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["PUT"])
@authentication_classes([VendorJWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def menu_item_update(request, item_id: int):
    """
    Protected.  Partially updates a MenuItem.
    Returns 403 if the authenticated vendor does not own the item.
    """
    item, err = _get_item_or_404(item_id)
    if err:
        return err

    ownership_err = _assert_owner(item, request.user)
    if ownership_err:
        return ownership_err

    # ── Optional Cloudinary photo upload ─────────────────────────────────────
    data = request.data.copy()
    photo_file = request.FILES.get("photo")
    if photo_file:
        try:
            photo_url = upload_vendor_photo(photo_file, vendor_id=request.user.pk)
            data["photo_url"] = photo_url
        except Exception as exc:
            message = str(exc)
            if hasattr(exc, "detail"):
                detail = exc.detail
                message = detail[0] if isinstance(detail, list) else str(detail)
            return _err(message)

    serializer = MenuItemUpdateSerializer(item, data=data, partial=True)
    if not serializer.is_valid():
        first_field = next(iter(serializer.errors))
        first_msg   = serializer.errors[first_field][0]
        return _err(f"{first_field}: {first_msg}")

    updated_item = serializer.save()
    return _ok({"item": MenuItemSerializer(updated_item).data})


# ─────────────────────────────────────────────────────────────────────────────
# DELETE /api/menu/<item_id>/   (protected, owner only)
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["DELETE"])
@authentication_classes([VendorJWTAuthentication])
@permission_classes([IsAuthenticated])
def menu_item_delete(request, item_id: int):
    """
    Protected.  Deletes a MenuItem.
    Returns 403 if the authenticated vendor does not own the item.
    """
    item, err = _get_item_or_404(item_id)
    if err:
        return err

    ownership_err = _assert_owner(item, request.user)
    if ownership_err:
        return ownership_err

    item.delete()
    return _ok({"message": f"Menu item '{item.name}' deleted successfully."})
