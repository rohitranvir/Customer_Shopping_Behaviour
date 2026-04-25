from django.urls import path
from . import views
urlpatterns=[
    path("product/",views.get_product),
path("category/",views.get_category),
]
