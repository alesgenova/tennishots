from django.contrib import admin

# Register your models here.
from .models import VideoShot, VideoSource, VideoClip

admin.site.register([VideoShot, VideoSource, VideoClip])
