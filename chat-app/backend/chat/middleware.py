import urllib.parse

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

from accounts.models import User


@database_sync_to_async
def get_user_from_token(token_key):
    """Validate a JWT access token and return the corresponding user."""
    try:
        token = AccessToken(token_key)
        user_id = token.payload.get('user_id')
        return User.objects.get(id=user_id) 
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom Channels middleware that authenticates WebSocket
    connections using a JWT token passed as a query parameter.

    Usage (client-side):
        new WebSocket('ws://host/ws/chat/<room_id>/?token=<jwt_access_token>')
    """

    async def __call__(self, scope, receive, send):
        # Parse query string for the 'token' parameter
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = urllib.parse.parse_qs(query_string)
        token_list = query_params.get('token', [])

        if token_list:
            scope['user'] = await get_user_from_token(token_list[0])
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
