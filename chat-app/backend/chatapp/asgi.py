"""
ASGI config for chatapp project.

Exposes the ASGI callable as a module-level variable named ``application``.

Routes HTTP requests through Django's standard ASGI handler and
WebSocket connections through Django Channels with JWT authentication.
"""

import os

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatapp.settings')
django.setup()

from channels.auth import AuthMiddlewareStack  # noqa: E402
from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from channels.security.websocket import AllowedHostsOriginValidator  # noqa: E402
from django.core.asgi import get_asgi_application  # noqa: E402

from chat.middleware import JWTAuthMiddleware  # noqa: E402
from chat.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        JWTAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
