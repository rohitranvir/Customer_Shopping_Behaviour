from rest_framework import generics, permissions, parsers
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
