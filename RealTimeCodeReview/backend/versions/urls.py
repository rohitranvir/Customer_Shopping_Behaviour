from django.urls import path
from .views import VersionHistoryListCreateView

urlpatterns = [
    path('', VersionHistoryListCreateView.as_view(), name='version-list-create'),
]
