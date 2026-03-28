import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatapp.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = "admin"
password = "password123"

# Check if user exists
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, "admin@example.com", password)
    print(f"Created user: {username} / {password}")
else:
    u = User.objects.get(username=username)
    u.set_password(password)
    u.save()
    print(f"Updated existing user: {username} / {password}")
