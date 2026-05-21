"""
VendorConnect India — Django Settings
Django 4.2 LTS  |  Python 3.11+

Environment variables are loaded from a .env file via python-dotenv.
"""

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

# ─────────────────────────────────────────────────────────────────────────────
# 0.  Paths & Environment
# ─────────────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env from project root (vendorconnect_backend/.env)
load_dotenv(BASE_DIR / ".env")

# ─────────────────────────────────────────────────────────────────────────────
# 1.  Core Security
# ─────────────────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ["SECRET_KEY"]

DEBUG = os.getenv("DEBUG", "False").lower() in ("1", "true", "yes")

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    # Railway injects RAILWAY_STATIC_URL / custom domain — add them at deploy time
    # e.g. os.getenv("RAILWAY_PUBLIC_DOMAIN", "")
]

# ─────────────────────────────────────────────────────────────────────────────
# 2.  Applications
# ─────────────────────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    # Django built-ins
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "cloudinary",
    "cloudinary_storage",

    # Project apps  (apps/<name>)
    "apps.accounts",
    "apps.vendors",
    "apps.menu",
    "apps.reviews",
]

# ─────────────────────────────────────────────────────────────────────────────
# 3.  Middleware
# ─────────────────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    # CORS must come before CommonMiddleware
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",   # static files in production
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "vendorconnect.urls"

# ─────────────────────────────────────────────────────────────────────────────
# 4.  Templates
# ─────────────────────────────────────────────────────────────────────────────
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "vendorconnect.wsgi.application"

# ─────────────────────────────────────────────────────────────────────────────
# 5.  Database
#     • No DATABASE_URL → SQLite (local dev)
#     • DATABASE_URL set  → PostgreSQL (Railway / staging / production)
# ─────────────────────────────────────────────────────────────────────────────
_DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if _DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            _DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# ─────────────────────────────────────────────────────────────────────────────
# 6.  Authentication & Password Validation
# ─────────────────────────────────────────────────────────────────────────────

# Custom user model (apps/accounts/models.py)
AUTH_USER_MODEL = "accounts.Vendor"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─────────────────────────────────────────────────────────────────────────────
# 7.  Internationalisation
# ─────────────────────────────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# ─────────────────────────────────────────────────────────────────────────────
# 8.  Static & Media Files
# ─────────────────────────────────────────────────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Cloudinary is used for all user-uploaded media
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
MEDIA_URL = "/media/"  # kept for local reference; actual URLs come from Cloudinary CDN

# ─────────────────────────────────────────────────────────────────────────────
# 9.  Cloudinary
# ─────────────────────────────────────────────────────────────────────────────
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": os.environ["CLOUDINARY_CLOUD_NAME"],
    "API_KEY": os.environ["CLOUDINARY_API_KEY"],
    "API_SECRET": os.environ["CLOUDINARY_API_SECRET"],
}

# ─────────────────────────────────────────────────────────────────────────────
# 10. CORS
# ─────────────────────────────────────────────────────────────────────────────
CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:3000")

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in CLIENT_URL.split(",")
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# ─────────────────────────────────────────────────────────────────────────────
# 11. Django REST Framework
# ─────────────────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        # Custom subclass — resolves token to Vendor + enforces is_active
        "apps.utils.authentication.VendorJWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# ─────────────────────────────────────────────────────────────────────────────
# 12. SimpleJWT
# ─────────────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=7),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": os.environ["JWT_SECRET"],
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
}

# ─────────────────────────────────────────────────────────────────────────────
# 13. Default Primary Key
# ─────────────────────────────────────────────────────────────────────────────
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
