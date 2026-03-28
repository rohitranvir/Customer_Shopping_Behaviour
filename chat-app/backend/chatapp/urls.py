from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from accounts.views import login, me, register, update_profile
from messages_app.views import FileUploadView
from rooms.views import RoomViewSet

# ── DRF Router ──
router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='room')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # JWT token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Auth endpoints
    path('api/register/', register, name='register'),
    path('api/login/', login, name='login'),
    path('api/me/', me, name='me'),
    path('api/profile/update/', update_profile, name='update_profile'),

    # Room routes (includes /api/rooms/, /api/rooms/<pk>/join/, /api/rooms/<pk>/leave/, /api/rooms/<pk>/messages/)
    path('api/', include(router.urls)),

    # File upload for a specific room
    path(
        'api/rooms/<uuid:room_id>/upload/',
        FileUploadView.as_view(),
        name='file_upload',
    ),
]

# ── Serve media files in development ──
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
