from django.urls import path
from . import views
# from ..backend.urls import urlpatterns


urlpatterns=[
    path('products/',views.get_products),
path('categories/',views.get_categories)
]