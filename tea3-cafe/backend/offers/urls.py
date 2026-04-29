from django.urls import path
from . import views

urlpatterns = [
    path('', views.ActiveOfferListView.as_view(), name='offer-active-list'),
    path('all/', views.AllOfferListView.as_view(), name='offer-all-list'),
    path('create/', views.OfferCreateView.as_view(), name='offer-create'),
    path('<int:pk>/update/', views.OfferUpdateView.as_view(), name='offer-update'),
    path('<int:pk>/delete/', views.OfferDeleteView.as_view(), name='offer-delete'),
]
