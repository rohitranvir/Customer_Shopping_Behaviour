from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingListView.as_view(), name='booking-list'),
    path('create/', views.BookingCreateView.as_view(), name='booking-create'),
    path('<int:pk>/update/', views.BookingUpdateView.as_view(), name='booking-update'),
    path('<int:pk>/delete/', views.BookingDeleteView.as_view(), name='booking-delete'),
]
