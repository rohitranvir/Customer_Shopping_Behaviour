import os

BASE_DIR = r"D:\Project\tea3-cafe\backend"

files = {}

# -------------------------------------------------------------
# ROOT
# -------------------------------------------------------------

files['requirements.txt'] = """django==4.2.7
djangorestframework==3.14.0
djongo==1.3.6
pymongo==3.12.3
cloudinary==1.36.0
django-cloudinary-storage==0.3.0
django-cors-headers==4.3.1
python-dotenv==1.0.0
djangorestframework-simplejwt==5.3.0
"""

files['.env'] = """SECRET_KEY=tea3-super-secret-key-change-in-prod
DEBUG=True
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tea3db
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
"""

files['manage.py'] = """#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tea3.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
"""

# -------------------------------------------------------------
# CORE PROJECT: tea3
# -------------------------------------------------------------

files['tea3/__init__.py'] = ""

files['tea3/asgi.py'] = """import os
from django.core.asgi import get_asgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tea3.settings')
application = get_asgi_application()
"""

files['tea3/wsgi.py'] = """import os
from django.core.wsgi import get_wsgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tea3.settings')
application = get_wsgi_application()
"""

files['tea3/urls.py'] = """from django.contrib import admin
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
"""

files['tea3/settings.py'] = """import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'default-unsafe-key')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'corsheaders',
    'cloudinary_storage',
    'cloudinary',
    
    'menu',
    'bookings',
    'gallery',
    'offers',
    'reviews',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'tea3.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'tea3.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': 'tea3db',
        'ENFORCE_SCHEMA': False,
        'CLIENT': {
            'host': os.environ.get('MONGO_URI', 'mongodb://localhost:27017/tea3db')
        }
    }
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Cloudinary
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

# CORS
CORS_ALLOWED_ORIGINS = [
    os.environ.get('FRONTEND_URL', 'http://localhost:5173')
]

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ]
}

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
"""


# -------------------------------------------------------------
# APP: menu
# -------------------------------------------------------------

files['menu/__init__.py'] = ""

files['menu/models.py'] = """from django.db import models

class MenuItem(models.Model):
    CATEGORY_CHOICES = [
        ('coffee', 'Coffee'),
        ('tea', 'Tea'),
        ('snacks', 'Snacks'),
        ('desserts', 'Desserts'),
        ('specials', 'Specials'),
    ]
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField()
    image = models.ImageField(upload_to='menu/', blank=True, null=True)
    is_popular = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - ₹{self.price}"
"""

files['menu/serializers.py'] = """from rest_framework import serializers
from .models import MenuItem

class MenuItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None
        
    class Meta:
        model = MenuItem
        fields = '__all__'
"""

files['menu/views.py'] = """from rest_framework import generics, permissions
from .models import MenuItem
from .serializers import MenuItemSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

class MenuItemListView(generics.ListAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['category', 'is_popular', 'is_available']
    search_fields = ['name', 'description']

class MenuItemDetailView(generics.RetrieveAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

class MenuItemCreateView(generics.CreateAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAdminUser]

class MenuItemUpdateView(generics.UpdateAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAdminUser]

class MenuItemDeleteView(generics.DestroyAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAdminUser]
"""

files['menu/urls.py'] = """from django.urls import path
from . import views

urlpatterns = [
    path('', views.MenuItemListView.as_view(), name='menu-list'),
    path('<int:pk>/', views.MenuItemDetailView.as_view(), name='menu-detail'),
    path('create/', views.MenuItemCreateView.as_view(), name='menu-create'),
    path('<int:pk>/update/', views.MenuItemUpdateView.as_view(), name='menu-update'),
    path('<int:pk>/delete/', views.MenuItemDeleteView.as_view(), name='menu-delete'),
]
"""

files['menu/admin.py'] = """from django.contrib import admin
from .models import MenuItem

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'is_popular', 'is_available']
    list_filter = ['category', 'is_popular', 'is_available']
    search_fields = ['name', 'description']
    list_editable = ['price', 'is_available', 'is_popular']
"""

files['menu/apps.py'] = """from django.apps import AppConfig
class MenuConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'menu'
"""


# -------------------------------------------------------------
# APP: bookings
# -------------------------------------------------------------

files['bookings/__init__.py'] = ""

files['bookings/models.py'] = """from django.db import models

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    date = models.DateField()
    time = models.TimeField()
    guests = models.IntegerField()
    special_requests = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} on {self.date} at {self.time}"
"""

files['bookings/serializers.py'] = """from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
"""

files['bookings/views.py'] = """from rest_framework import generics, permissions
from .models import Booking
from .serializers import BookingSerializer
from django_filters.rest_framework import DjangoFilterBackend
from django.core.mail import send_mail
from django.conf import settings

class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        booking = serializer.save()
        # Send confirmation email
        subject = "New Booking Request - Tea3 Café"
        message = f"Details:\\nName: {booking.name}\\nDate: {booking.date}\\nTime: {booking.time}\\nGuests: {booking.guests}\\nRequests: {booking.special_requests}"
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [settings.EMAIL_HOST_USER, booking.email],
                fail_silently=True,
            )
        except Exception as e:
            pass # Handle or log email failure if needed

class BookingListView(generics.ListAPIView):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'date']

class BookingUpdateView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAdminUser]

class BookingDeleteView(generics.DestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAdminUser]
"""

files['bookings/urls.py'] = """from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingListView.as_view(), name='booking-list'),
    path('create/', views.BookingCreateView.as_view(), name='booking-create'),
    path('<int:pk>/update/', views.BookingUpdateView.as_view(), name='booking-update'),
    path('<int:pk>/delete/', views.BookingDeleteView.as_view(), name='booking-delete'),
]
"""

files['bookings/admin.py'] = """from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['name', 'date', 'time', 'guests', 'status', 'phone']
    list_filter = ['status', 'date']
    list_editable = ['status']
    ordering = ['-created_at']
"""

files['bookings/apps.py'] = """from django.apps import AppConfig
class BookingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bookings'
"""


# -------------------------------------------------------------
# APP: gallery
# -------------------------------------------------------------

files['gallery/__init__.py'] = ""

files['gallery/models.py'] = """from django.db import models

class GalleryImage(models.Model):
    CATEGORY_CHOICES = [
        ('food','Food'),
        ('coffee','Coffee'),
        ('ambience','Ambience'),
        ('events','Events')
    ]
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to='gallery/')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    is_active = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
"""

files['gallery/serializers.py'] = """from rest_framework import serializers
from .models import GalleryImage

class GalleryImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None
        
    class Meta:
        model = GalleryImage
        fields = '__all__'
"""

files['gallery/views.py'] = """from rest_framework import generics, permissions, parsers
from .models import GalleryImage
from .serializers import GalleryImageSerializer
from django_filters.rest_framework import DjangoFilterBackend

class GalleryListView(generics.ListAPIView):
    queryset = GalleryImage.objects.filter(is_active=True)
    serializer_class = GalleryImageSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']

class GalleryCreateView(generics.CreateAPIView):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

class GalleryDeleteView(generics.DestroyAPIView):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    permission_classes = [permissions.IsAdminUser]
"""

files['gallery/urls.py'] = """from django.urls import path
from . import views

urlpatterns = [
    path('', views.GalleryListView.as_view(), name='gallery-list'),
    path('upload/', views.GalleryCreateView.as_view(), name='gallery-upload'),
    path('<int:pk>/delete/', views.GalleryDeleteView.as_view(), name='gallery-delete'),
]
"""

files['gallery/admin.py'] = """from django.contrib import admin
from .models import GalleryImage

@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_active', 'uploaded_at']
    list_filter = ['category', 'is_active']
    list_editable = ['is_active']
"""

files['gallery/apps.py'] = """from django.apps import AppConfig
class GalleryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gallery'
"""


# -------------------------------------------------------------
# APP: offers
# -------------------------------------------------------------

files['offers/__init__.py'] = ""

files['offers/models.py'] = """from django.db import models

class Offer(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    discount_percent = models.IntegerField()
    valid_till = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
"""

files['offers/serializers.py'] = """from rest_framework import serializers
from .models import Offer

class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = '__all__'
"""

files['offers/views.py'] = """from rest_framework import generics, permissions
from .models import Offer
from .serializers import OfferSerializer

class ActiveOfferListView(generics.ListAPIView):
    queryset = Offer.objects.filter(is_active=True)
    serializer_class = OfferSerializer

class AllOfferListView(generics.ListAPIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAdminUser]

class OfferCreateView(generics.CreateAPIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAdminUser]

class OfferUpdateView(generics.UpdateAPIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAdminUser]

class OfferDeleteView(generics.DestroyAPIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAdminUser]
"""

files['offers/urls.py'] = """from django.urls import path
from . import views

urlpatterns = [
    path('', views.ActiveOfferListView.as_view(), name='offer-active-list'),
    path('all/', views.AllOfferListView.as_view(), name='offer-all-list'),
    path('create/', views.OfferCreateView.as_view(), name='offer-create'),
    path('<int:pk>/update/', views.OfferUpdateView.as_view(), name='offer-update'),
    path('<int:pk>/delete/', views.OfferDeleteView.as_view(), name='offer-delete'),
]
"""

files['offers/admin.py'] = """from django.contrib import admin
from .models import Offer

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'discount_percent', 'valid_till', 'is_active']
    list_filter = ['is_active']
    list_editable = ['is_active', 'valid_till']
"""

files['offers/apps.py'] = """from django.apps import AppConfig
class OffersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'offers'
"""


# -------------------------------------------------------------
# APP: reviews
# -------------------------------------------------------------

files['reviews/__init__.py'] = ""

files['reviews/models.py'] = """from django.db import models

class Review(models.Model):
    name = models.CharField(max_length=200)
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.rating} Stars"
"""

files['reviews/serializers.py'] = """from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None

    class Meta:
        model = Review
        fields = '__all__'
"""

files['reviews/views.py'] = """from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer

class ApprovedReviewListView(generics.ListAPIView):
    queryset = Review.objects.filter(is_approved=True)
    serializer_class = ReviewSerializer

class ReviewCreateView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

class AllReviewListView(generics.ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAdminUser]

class ReviewUpdateView(generics.UpdateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAdminUser]

class ReviewDeleteView(generics.DestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAdminUser]
"""

files['reviews/urls.py'] = """from django.urls import path
from . import views

urlpatterns = [
    path('', views.ApprovedReviewListView.as_view(), name='review-approved-list'),
    path('submit/', views.ReviewCreateView.as_view(), name='review-submit'),
    path('all/', views.AllReviewListView.as_view(), name='review-all-list'),
    path('<int:pk>/approve/', views.ReviewUpdateView.as_view(), name='review-approve'),
    path('<int:pk>/delete/', views.ReviewDeleteView.as_view(), name='review-delete'),
]
"""

files['reviews/admin.py'] = """from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['name', 'rating', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'rating']
    list_editable = ['is_approved']
"""

files['reviews/apps.py'] = """from django.apps import AppConfig
class ReviewsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reviews'
"""

# -------------------------------------------------------------
# WRITE FILES
# -------------------------------------------------------------

import pathlib

for rel_path, content in files.items():
    file_path = os.path.join(BASE_DIR, rel_path)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Scaffolded {len(files)} Django backend files successfully!")
