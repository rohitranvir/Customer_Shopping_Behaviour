"""
reviews/urls.py

The review endpoints are REST-nested under vendors:
  GET  /api/vendors/<vendor_id>/reviews/
  POST /api/vendors/<vendor_id>/reviews/

Both are wired in apps/vendors/urls.py, not here.
This file is kept for Django app completeness and future standalone routes.
"""

from django.urls import path

urlpatterns = []
