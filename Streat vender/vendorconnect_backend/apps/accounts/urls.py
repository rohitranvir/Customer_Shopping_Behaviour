"""
accounts/urls.py

All routes are prefixed by /api/auth/ (set in root urls.py).
"""

from django.urls import path

from . import views

urlpatterns = [
    path("register", views.register, name="auth-register"),
    path("login",    views.login,    name="auth-login"),
    path("me",       views.me,       name="auth-me"),
]
