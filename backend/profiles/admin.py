from django.contrib import admin

# Register your models here.
from .models import UserProfile, FriendRequest

admin.site.register([UserProfile, FriendRequest])
