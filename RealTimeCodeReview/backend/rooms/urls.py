from django.urls import path
from .views import RoomCreateView, RoomDetailView, JoinRoomView, ExecuteCodeView, GitHubImportView

urlpatterns = [
    path('create/', RoomCreateView.as_view(), name='room-create'),
    path('<uuid:pk>/', RoomDetailView.as_view(), name='room-detail'),
    path('<uuid:pk>/join/', JoinRoomView.as_view(), name='room-join'),
    path('<uuid:pk>/execute/', ExecuteCodeView.as_view(), name='room-execute'),
    path('<uuid:pk>/github/', GitHubImportView.as_view(), name='room-github'),
]
