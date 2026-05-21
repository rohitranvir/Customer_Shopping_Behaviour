"""
VendorConnect India — Root URL Configuration
"""

from django.contrib import admin
from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


# ── Health-check endpoint ────────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """
    GET /api/health
    Returns a simple JSON payload confirming the server is up.
    """
    return Response(
        {
            "success": True,
            "message": "VendorConnect India is running",
        }
    )


# ── URL Patterns ─────────────────────────────────────────────────────────────
urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # Health check
    path("api/health", health_check, name="health-check"),

    # App routes  (each app exposes its own urls.py)
    path("api/auth/",    include("apps.accounts.urls")),
    path("api/vendors/", include("apps.vendors.urls")),
    path("api/menu/",    include("apps.menu.urls")),
    path("api/reviews/", include("apps.reviews.urls")),

    # SimpleJWT token endpoints (optional convenience – apps.accounts can wrap these)
    # path("api/token/",         TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # path("api/token/refresh/", TokenRefreshView.as_view(),    name="token_refresh"),
]
