from django.contrib import admin

# Register your models here.
from .models import VideoShot, VideoSource, VideoCollection

admin.site.register([VideoShot, VideoSource, VideoCollection])
