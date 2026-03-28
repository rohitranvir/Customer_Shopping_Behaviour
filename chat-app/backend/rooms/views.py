from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from messages_app.models import Message
from messages_app.serializers import MessageSerializer
from .models import Room
from .serializers import RoomSerializer


class MessagePagination(PageNumberPagination):
    """Pagination settings for room messages."""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class RoomViewSet(ModelViewSet):
    """
    ViewSet for managing chat rooms.

    Provides standard CRUD operations plus custom actions
    for joining, leaving, and retrieving room messages.
    """

    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MessagePagination
    lookup_field = 'pk'

    def get_queryset(self):
        """Return public rooms and rooms the user is a member of."""
        user = self.request.user
        return Room.objects.filter(
            Q(room_type='public') | Q(members=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        """Set the creator and add them as a member."""
        room = serializer.save(created_by=self.request.user)
        room.members.add(self.request.user)

    @action(detail=True, methods=['post'], url_path='join')
    def join(self, request, pk=None):
        """Join a room. Private rooms require a valid password."""
        room = self.get_object()
        user = request.user

        if room.members.filter(pk=user.pk).exists():
            return Response(
                {'detail': 'You are already a member of this room.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate password for private rooms
        if room.room_type == 'private':
            password = request.data.get('password', '')
            if password != room.password:
                return Response(
                    {'detail': 'Incorrect room password.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        room.members.add(user)
        return Response(
            {'detail': f'Successfully joined room "{room.name}".'},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['post'], url_path='leave')
    def leave(self, request, pk=None):
        """Leave a room."""
        room = self.get_object()
        user = request.user

        if not room.members.filter(pk=user.pk).exists():
            return Response(
                {'detail': 'You are not a member of this room.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        room.members.remove(user)
        return Response(
            {'detail': f'Successfully left room "{room.name}".'},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['get'], url_path='messages')
    def messages(self, request, pk=None):
        """Return paginated messages for the room."""
        room = self.get_object()
        queryset = Message.objects.filter(room=room).select_related(
            'sender'
        ).prefetch_related(
            'receipts', 'receipts__user'
        ).order_by('timestamp')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = MessageSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = MessageSerializer(queryset, many=True)
        return Response(serializer.data)
