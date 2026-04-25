"""
API URL configuration.

Public endpoints (no auth):
  GET  /api/projects/
  GET  /api/projects/<id>/
  GET  /api/skills/
  GET  /api/experience/
  GET  /api/experience/<id>/
  GET  /api/certifications/
  GET  /api/certifications/<id>/
  POST /api/messages/              ← contact form
  GET  /api/settings/

Auth endpoints:
  POST /api/auth/login/            ← get access + refresh tokens
  POST /api/auth/refresh/          ← refresh access token
  POST /api/auth/logout/           ← blacklist refresh token

Admin-only endpoints (require: Authorization: Bearer <token>):
  POST   /api/projects/
  PUT    /api/projects/<id>/
  PATCH  /api/projects/<id>/
  DELETE /api/projects/<id>/
  -- same pattern for /skills/manage/, /experience/, /certifications/ --
  GET    /api/messages/admin/
  PATCH  /api/messages/admin/<id>/
  DELETE /api/messages/admin/<id>/
  PATCH  /api/settings/
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView

from .views import (
    AdminLoginView,
    ProjectListCreateView,
    ProjectDetailView,
    SkillsGroupedView,
    SkillListCreateView,
    SkillDetailView,
    ExperienceListCreateView,
    ExperienceDetailView,
    CertificationListCreateView,
    CertificationDetailView,
    MessageCreateView,
    MessageListView,
    MessageDetailView,
    SiteSettingsView,
)

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────
    path('auth/login/',   AdminLoginView.as_view(),    name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(),  name='auth-refresh'),
    path('auth/logout/',  TokenBlacklistView.as_view(), name='auth-logout'),

    # ── Projects ───────────────────────────────────────────────
    path('projects/',       ProjectListCreateView.as_view(), name='project-list'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(),  name='project-detail'),

    # ── Skills ─────────────────────────────────────────────────
    # Public grouped response (used by React frontend)
    path('skills/',              SkillsGroupedView.as_view(),   name='skills-grouped'),
    # Admin flat list / CRUD
    path('skills/manage/',       SkillListCreateView.as_view(), name='skill-list'),
    path('skills/manage/<int:pk>/', SkillDetailView.as_view(), name='skill-detail'),

    # ── Experience ─────────────────────────────────────────────
    path('experience/',          ExperienceListCreateView.as_view(), name='experience-list'),
    path('experience/<int:pk>/', ExperienceDetailView.as_view(),     name='experience-detail'),

    # ── Certifications ─────────────────────────────────────────
    path('certifications/',          CertificationListCreateView.as_view(), name='cert-list'),
    path('certifications/<int:pk>/', CertificationDetailView.as_view(),    name='cert-detail'),

    # ── Messages ───────────────────────────────────────────────
    path('messages/',              MessageCreateView.as_view(), name='message-create'),
    path('messages/admin/',        MessageListView.as_view(),   name='message-list'),
    path('messages/admin/<int:pk>/', MessageDetailView.as_view(), name='message-detail'),

    # ── Settings ───────────────────────────────────────────────
    path('settings/', SiteSettingsView.as_view(), name='settings'),
]
