from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/rooms/', include('rooms.urls')),
    path('api/comments/', include('comments.urls')),
    path('api/versions/', include('versions.urls')),
]
