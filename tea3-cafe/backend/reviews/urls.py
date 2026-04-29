from django.urls import path
from . import views

urlpatterns = [
    path('', views.ApprovedReviewListView.as_view(), name='review-approved-list'),
    path('submit/', views.ReviewCreateView.as_view(), name='review-submit'),
    path('all/', views.AllReviewListView.as_view(), name='review-all-list'),
    path('<int:pk>/approve/', views.ReviewUpdateView.as_view(), name='review-approve'),
    path('<int:pk>/delete/', views.ReviewDeleteView.as_view(), name='review-delete'),
]
