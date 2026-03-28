import mimetypes

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


from rooms.models import Room
from .models import Message
from .serializers import MessageSerializer


class FileUploadView(APIView):
    """
    Handle file uploads for chat messages.

    Accepts a multipart file upload, creates a Message with the file
    attached, and broadcasts the new message to the room's WebSocket
    channel group.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request, room_id):
        try:
            room = Room.objects.get(pk=room_id)
        except Room.DoesNotExist:
            return Response(
                {'error': 'Room not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response(
                {'error': 'No file provided.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Detect MIME type
        file_type, _ = mimetypes.guess_type(uploaded_file.name)
        if file_type is None:
            file_type = 'application/octet-stream'

        # Create message with the uploaded file
        message = Message.objects.create(
            room=room,
            sender=request.user,
            content=request.data.get('content', ''),
            file=uploaded_file,
            file_type=file_type,
        )

        # Broadcast to the room's WebSocket channel group
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'chat_{room_id}',
            {
                'type': 'chat_message',
                'message_id': str(message.id),
                'content': message.content,
                'file': message.file.url if message.file else None,
                'file_type': message.file_type,
                'sender_id': request.user.id,
                'sender_username': request.user.username,
                'timestamp': message.timestamp.isoformat(),
            },
        )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
