from rest_framework import generics, permissions
from .models import VersionHistory
from .serializers import VersionHistorySerializer

class VersionHistoryListCreateView(generics.ListCreateAPIView):
    serializer_class = VersionHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = VersionHistory.objects.all()
        room_id = self.request.query_params.get('room')
        if room_id:
            queryset = queryset.filter(room_id=room_id).order_by('-created_at')
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
