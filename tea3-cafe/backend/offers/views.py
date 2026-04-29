from rest_framework import generics, permissions
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
