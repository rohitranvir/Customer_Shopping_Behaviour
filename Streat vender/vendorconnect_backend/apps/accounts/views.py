"""
accounts/views.py

POST /api/auth/register   → 201  { success, data: { token, vendor } }
POST /api/auth/login      → 200  { success, data: { token, vendor } }

Errors always return:       { success: false, error: "message" }
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Vendor
from .serializers import LoginSerializer, RegisterSerializer, VendorSerializer


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _access_token_for(vendor: Vendor) -> str:
    """Generate a SimpleJWT access token for the given vendor."""
    refresh = RefreshToken.for_user(vendor)
    return str(refresh.access_token)


def _success(data: dict, http_status=status.HTTP_200_OK) -> Response:
    return Response({"success": True, "data": data}, status=http_status)


def _error(message: str, http_status=status.HTTP_400_BAD_REQUEST) -> Response:
    return Response({"success": False, "error": message}, status=http_status)


# ─────────────────────────────────────────────────────────────────────────────
# Register
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/auth/register
    Body: { name, owner_name, phone, password, [optional fields...] }
    Returns 201 with access token + vendor object (no password).
    """
    serializer = RegisterSerializer(data=request.data)

    if not serializer.is_valid():
        # Flatten nested error messages into a single readable string
        errors = serializer.errors
        first_field  = next(iter(errors))
        first_msg    = errors[first_field]
        if isinstance(first_msg, list):
            first_msg = first_msg[0]
        if isinstance(first_msg, list):          # nested list (e.g. password validators)
            first_msg = first_msg[0]
        return _error(f"{first_field}: {first_msg}", status.HTTP_400_BAD_REQUEST)

    vendor = serializer.save()
    token  = _access_token_for(vendor)

    return _success(
        {
            "token":  token,
            "vendor": VendorSerializer(vendor).data,
        },
        status.HTTP_201_CREATED,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Login
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    POST /api/auth/login
    Body: { phone, password }
    Returns 200 with access token + vendor object (no password).
    """
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        first_field = next(iter(serializer.errors))
        first_msg   = serializer.errors[first_field][0]
        return _error(f"{first_field}: {first_msg}", status.HTTP_400_BAD_REQUEST)

    phone    = serializer.validated_data["phone"]
    password = serializer.validated_data["password"]

    # Look up vendor by phone
    try:
        vendor = Vendor.objects.get(phone=phone)
    except Vendor.DoesNotExist:
        return _error("Invalid phone number or password.", status.HTTP_401_UNAUTHORIZED)

    # Verify password
    if not vendor.check_password(password):
        return _error("Invalid phone number or password.", status.HTTP_401_UNAUTHORIZED)

    # Guard against deactivated accounts
    if not vendor.is_active:
        return _error("This account has been deactivated.", status.HTTP_403_FORBIDDEN)

    token = _access_token_for(vendor)

    return _success(
        {
            "token":  token,
            "vendor": VendorSerializer(vendor).data,
        }
    )


# ─────────────────────────────────────────────────────────────────────────────
# Me  (protected — retrieve currently authenticated vendor)
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
def me(request):
    """
    GET /api/auth/me
    Returns the authenticated vendor's profile.
    Requires: Authorization: Bearer <token>
    """
    return _success({"vendor": VendorSerializer(request.user).data})
