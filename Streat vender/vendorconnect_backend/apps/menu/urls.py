"""
menu/urls.py

Routes prefixed with /api/menu/ (set in root urls.py).

  POST   /api/menu/             → create a new item  (protected)
  PUT    /api/menu/<item_id>/   → partial update      (protected, owner-only)
  DELETE /api/menu/<item_id>/   → delete              (protected, owner-only)

NOTE: The public list  GET /api/vendors/<vendor_id>/menu/
      is wired in apps/vendors/urls.py and handled by apps.menu.views.vendor_menu_list.
"""

from django.urls import path

from . import views

urlpatterns = [
    path("",              views.menu_item_create, name="menu-item-create"),
    path("<int:item_id>/", views.menu_item_update, name="menu-item-update"),
    path("<int:item_id>/delete/", views.menu_item_delete, name="menu-item-delete"),
]
