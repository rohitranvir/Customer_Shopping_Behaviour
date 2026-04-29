from rest_framework import generics, permissions
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
        message = f"Details:\nName: {booking.name}\nDate: {booking.date}\nTime: {booking.time}\nGuests: {booking.guests}\nRequests: {booking.special_requests}"
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
