import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone

from accounts.models import User
from messages_app.models import Message, MessageReadReceipt


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat within a room.

    Handles:
      - Chat messages (broadcast to room)
      - Typing indicators
      - Read receipts
      - Presence updates (online/offline)
    """

    # ──────────────────────────────────────────────
    #  Connection lifecycle
    # ──────────────────────────────────────────────

    async def connect(self):
        """Accept connection if authenticated, otherwise close with 4001."""
        self.user = self.scope.get('user', AnonymousUser())

        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        # Join the room channel group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

        # Mark user as online and broadcast presence
        await self.set_user_online(True)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'presence_update',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_online': True,
            },
        )

    async def disconnect(self, close_code):
        """Mark user offline and leave the room channel group."""
        if hasattr(self, 'user') and self.user.is_authenticated:
            await self.set_user_online(False)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'presence_update',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'is_online': False,
                },
            )

        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name,
            )

    # ──────────────────────────────────────────────
    #  Incoming WebSocket messages
    # ──────────────────────────────────────────────

    async def receive(self, text_data):
        """Route incoming messages by their 'type' field."""
        data = json.loads(text_data)
        msg_type = data.get('type', '')

        if msg_type == 'chat_message':
            await self.handle_message(data)
        elif msg_type == 'typing':
            await self.handle_typing(data)
        elif msg_type == 'read_receipt':
            await self.handle_read_receipt(data)

    async def handle_message(self, data):
        """Save a chat message to the DB and broadcast it to the room."""
        content = data.get('content', '')
        message = await self.save_message(content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message_id': str(message.id),
                'content': message.content,
                'sender_id': self.user.id,
                'sender_username': self.user.username,
                'timestamp': message.timestamp.isoformat(),
            },
        )

    async def handle_typing(self, data):
        """Broadcast a typing indicator to the room."""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_typing': data.get('is_typing', False),
            },
        )

    async def handle_read_receipt(self, data):
        """Mark a message as read and broadcast the receipt."""
        message_id = data.get('message_id')
        if not message_id:
            return

        await self.mark_as_read(message_id)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'read_receipt',
                'message_id': message_id,
                'user_id': self.user.id,
                'username': self.user.username,
            },
        )

    # ──────────────────────────────────────────────
    #  Channel layer event handlers (group → client)
    # ──────────────────────────────────────────────

    async def chat_message(self, event):
        """Forward a chat message event to the WebSocket client."""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message_id': event['message_id'],
            'content': event.get('content', ''),
            'file': event.get('file'),
            'file_type': event.get('file_type', ''),
            'sender_id': event['sender_id'],
            'sender_username': event['sender_username'],
            'timestamp': event['timestamp'],
        }))

    async def presence_update(self, event):
        """Forward a presence update event to the WebSocket client."""
        await self.send(text_data=json.dumps({
            'type': 'presence_update',
            'user_id': event['user_id'],
            'username': event['username'],
            'is_online': event['is_online'],
        }))

    async def typing_indicator(self, event):
        """Forward a typing indicator event to the WebSocket client."""
        await self.send(text_data=json.dumps({
            'type': 'typing_indicator',
            'user_id': event['user_id'],
            'username': event['username'],
            'is_typing': event['is_typing'],
        }))

    async def read_receipt(self, event):
        """Forward a read receipt event to the WebSocket client."""
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
            'username': event['username'],
        }))

    # ──────────────────────────────────────────────
    #  Database helpers (sync → async bridge)
    # ──────────────────────────────────────────────

    @database_sync_to_async
    def save_message(self, content):
        """Persist a new chat message to the database."""
        return Message.objects.create(
            room_id=self.room_id,
            sender=self.user,
            content=content,
        )

    @database_sync_to_async
    def mark_as_read(self, message_id):
        """Create a read receipt (idempotent via get_or_create)."""
        MessageReadReceipt.objects.get_or_create(
            message_id=message_id,
            user=self.user,
        )

    @database_sync_to_async
    def set_user_online(self, is_online):
        """Update the user's online status and last-seen timestamp."""
        User.objects.filter(id=self.user.id).update(
            is_online=is_online,
            last_seen=timezone.now(),
        )
