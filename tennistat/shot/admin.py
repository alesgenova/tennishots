from django.contrib import admin

# Register your models here.
from .models import Year, Month, Week, Day, Session, Shot, SonyData

admin.site.register([Year, Month, Week, Day, Session, Shot, SonyData])
