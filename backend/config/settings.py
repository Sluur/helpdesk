from pathlib import Path
import os
from datetime import timedelta

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------------------------------------------------------------
# ENV helpers
# -----------------------------------------------------------------------------
def env(name: str, default: str | None = None) -> str | None:
    return os.getenv(name, default)

def env_bool(name: str, default: bool = False) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    return val.lower() in ("1", "true", "yes", "on")

def env_list(name: str, default: str = "") -> list[str]:
    raw = os.getenv(name, default)
    return [x.strip() for x in raw.split(",") if x.strip()]

# -----------------------------------------------------------------------------
# Core settings
# -----------------------------------------------------------------------------
SECRET_KEY = env("SECRET_KEY", "dev-only-secret-key-change-me")
DEBUG = env_bool("DEBUG", True)

# Railway sets RAILWAY_PUBLIC_DOMAIN on some setups; we support both.
DEFAULT_ALLOWED = "localhost,127.0.0.1"
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", DEFAULT_ALLOWED)
if DEBUG:
    # Optional: allow all in dev to avoid friction
    # Comment out if you prefer strict hosts even in dev.
    ALLOWED_HOSTS = ["*"]

# If you use CSRF cookies in future, configure this.
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", "")

# -----------------------------------------------------------------------------
# Apps
# -----------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",

    "accounts",
    "tickets",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # serve static in prod

    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# -----------------------------------------------------------------------------
# Database
# -----------------------------------------------------------------------------
# Local dev defaults to sqlite; Railway uses DATABASE_URL for Postgres.
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

# -----------------------------------------------------------------------------
# Auth
# -----------------------------------------------------------------------------
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = env("TIME_ZONE", "UTC")
USE_I18N = True
USE_TZ = True

# -----------------------------------------------------------------------------
# Static files
# -----------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# WhiteNoise compression
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    }
}

# -----------------------------------------------------------------------------
# DRF / JWT
# -----------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    # Optional but recommended for public demo:
    # "DEFAULT_THROTTLE_CLASSES": [
    #     "rest_framework.throttling.UserRateThrottle",
    #     "rest_framework.throttling.AnonRateThrottle",
    # ],
    # "DEFAULT_THROTTLE_RATES": {
    #     "anon": "20/hour",
    #     "user": "200/hour",
    # },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(env("ACCESS_TOKEN_MINUTES", "10"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(env("REFRESH_TOKEN_DAYS", "7"))),
    "ROTATE_REFRESH_TOKENS": env_bool("ROTATE_REFRESH_TOKENS", False),
    "BLACKLIST_AFTER_ROTATION": env_bool("BLACKLIST_AFTER_ROTATION", False),
}

# -----------------------------------------------------------------------------
# CORS
# -----------------------------------------------------------------------------
# Local + Vercel domain(s). Comma separated.
# Example:
# CORS_ALLOWED_ORIGINS="http://localhost:5173,https://your-frontend.vercel.app"
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:5173")

# If you ever use cookies auth, you’ll need:
# CORS_ALLOW_CREDENTIALS = True

# -----------------------------------------------------------------------------
# Security headers (basic)
# -----------------------------------------------------------------------------
# You can keep these off in dev.
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", False)  # Railway usually already handles HTTPS
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
