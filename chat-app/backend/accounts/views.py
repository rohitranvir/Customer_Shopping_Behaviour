from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer


def _get_tokens_for_user(user):
    """Generate JWT access and refresh tokens for the given user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user and return JWT tokens."""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = _get_tokens_for_user(user)
        return Response(
            {
                'tokens': tokens,
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Authenticate user and return JWT tokens."""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=username, password=password)
    if user is None:
        return Response(
            {'error': 'Invalid credentials.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Mark user as online
    user.is_online = True
    user.save(update_fields=['is_online'])

    tokens = _get_tokens_for_user(user)
    return Response({
        'tokens': tokens,
        'user': UserSerializer(user).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Return the current authenticated user's profile."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update the current user's avatar and bio."""
    serializer = UserSerializer(
        request.user,
        data=request.data,
        partial=True,
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
