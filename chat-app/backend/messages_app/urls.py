from django.urls import path

from .views import FileUploadView

app_name = 'messages_app'

urlpatterns = [
    path(
        'rooms/<uuid:room_id>/upload/',
        FileUploadView.as_view(),
        name='file_upload',
    ),
]
