from django.urls import path

from .views import login, me, register, update_profile

app_name = 'accounts'

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('me/', me, name='me'),
    path('profile/update/', update_profile, name='update_profile'),
]
