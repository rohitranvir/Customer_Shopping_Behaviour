from django.urls import path
from . import views

urlpatterns = [
    path('', views.GalleryListView.as_view(), name='gallery-list'),
    path('upload/', views.GalleryCreateView.as_view(), name='gallery-upload'),
    path('<int:pk>/delete/', views.GalleryDeleteView.as_view(), name='gallery-delete'),
]
