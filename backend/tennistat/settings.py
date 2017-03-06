"""
Django settings for tennistat project.

Generated by 'django-admin startproject' using Django 1.10.4.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.10/ref/settings/
"""

import os
import datetime as dt
from corsheaders.defaults import default_headers

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.10/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'pg_dns8)rkmo*d=&&03)rgysu%ff$hc4(u%5!*c@a4t2hypbd!'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

#ALLOWED_HOSTS = ['tennistat.xyz','www.tennistat.xyz', 'api.tennistat.xyz']
ALLOWED_HOSTS = ['api.tennistat.xyz', 'localhost']

SITE_ID = 1

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'profiles',
    'customers',
    'shot',
    'video',
    'api',
    'rest_auth',
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'rest_auth.registration',
    'django_celery_results',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'tennistat.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        #'DIRS': [],
        'DIRS':  [os.path.join(BASE_DIR, 'templates')],
        #'DIRS': ['/home/tennistat/webapps/tennistat2/frontend/dist'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'tennistat.wsgi.application'

#REST_AUTH_SERIALIZERS = {
#    'USER_DETAILS_SERIALIZER': 'api.serializers.UserSerializer'
#}

# CORS allowed hosts
CORS_ORIGIN_WHITELIST = (
    'www.tennistat.xyz',
    'tennistat.xyz',
    'localhost:4200',
    'localhost:8000',
)

#CORS_ALLOW_HEADERS = default_headers + (
#    'X-XSRF-TOKEN',
#)
#CORS_ALLOW_CREDENTIALS = True

# CHANGE CSRF NAMES TO MATCH ANGULAR2 DEFAULTS
#CSRF_COOKIE_NAME = 'XSRF-TOKEN'
#CSRF_HEADER_NAME = 'X-XSRF-TOKEN'


# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        'OPTIONS': {
            'timeout': 10,
        }
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# REST
REST_FRAMEWORK = {
        'DEFAULT_PERMISSION_CLASSES': [
                'rest_framework.permissions.IsAuthenticated',
                #'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly',
                #'rest_framework.permissions.AllowAny',
                ],
        'DEFAULT_AUTHENTICATION_CLASSES': (
                'rest_framework.authentication.SessionAuthentication',
                'rest_framework.authentication.BasicAuthentication',
                'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
            ),
        }

REST_USE_JWT = True

JWT_AUTH = {
            # ONE WEEK INSECURE?
            'JWT_EXPIRATION_DELTA':dt.timedelta(seconds=604800),
            #'JWT_AUTH_HEADER_PREFIX': 'Bearer',
            #'JWT_EXPIRATION_DELTA':dt.timedelta(seconds=3600),
           }

# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = '/static/'

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL ='/media/'

# CELERY
CELERY_BROKER_URL = "amqp://guest:guest@localhost:5672//"
CELERY_RESULT_BACKEND = 'django-db'

# Gmail SETUP
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'tennistat.xyz@gmail.com'
EMAIL_HOST_PASSWORD = 'vitellOtonnatO87'
EMAIL_PORT = 587
