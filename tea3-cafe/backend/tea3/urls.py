from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/menu/', include('menu.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/gallery/', include('gallery.urls')),
    path('api/offers/', include('offers.urls')),
    path('api/reviews/', include('reviews.urls')),
    
    # JWT Auth
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
