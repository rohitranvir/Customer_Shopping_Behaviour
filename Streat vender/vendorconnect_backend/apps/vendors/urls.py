"""
vendors/urls.py

All routes prefixed by /api/vendors/ (set in root urls.py).

Route order matters:
  "profile/"       must come before "<int:pk>/" so the literal word "profile"
  "profile/photo/" is not mistaken for a numeric vendor ID.
"""

from django.urls import path

from . import views
from apps.menu.views import vendor_menu_list
from apps.reviews.views import vendor_reviews

urlpatterns = [
    # Protected — own profile management
    path("profile/",       views.vendor_update_profile, name="vendor-update-profile"),
    path("profile/photo/", views.vendor_upload_photo,   name="vendor-upload-photo"),

    # Public — list & detail
    path("",               views.vendor_list,   name="vendor-list"),
    path("<int:pk>/",      views.vendor_detail, name="vendor-detail"),

    # Public — menu items for a specific vendor
    # GET /api/vendors/<vendor_id>/menu/
    path("<int:vendor_id>/menu/",    vendor_menu_list, name="vendor-menu-list"),

    # Public — reviews for a specific vendor
    # GET  /api/vendors/<vendor_id>/reviews/
    # POST /api/vendors/<vendor_id>/reviews/
    path("<int:vendor_id>/reviews/", vendor_reviews,   name="vendor-reviews"),
]

