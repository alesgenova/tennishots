from django.contrib import admin
from .models import Order, Transaction, CustomerProfile, RateChange
# Register your models here.
admin.site.register([Order, Transaction, CustomerProfile, RateChange])
