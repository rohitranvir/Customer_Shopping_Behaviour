from django.urls import path
from . import views

urlpatterns = [
    path('', views.MenuItemListView.as_view(), name='menu-list'),
    path('<int:pk>/', views.MenuItemDetailView.as_view(), name='menu-detail'),
    path('create/', views.MenuItemCreateView.as_view(), name='menu-create'),
    path('<int:pk>/update/', views.MenuItemUpdateView.as_view(), name='menu-update'),
    path('<int:pk>/delete/', views.MenuItemDeleteView.as_view(), name='menu-delete'),
]
