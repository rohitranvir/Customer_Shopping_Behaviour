from rest_framework import generics, permissions
from .models import Comment
from .serializers import CommentSerializer
import django_filters.rest_framework as filters

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Comment.objects.all()
        room_id = self.request.query_params.get('room')
        if room_id is not None:
            queryset = queryset.filter(room_id=room_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
