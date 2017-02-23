from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


# Create your models here.
class Order(models.Model):
    timestamp = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(User)
    shots = models.IntegerField()
    videoshots = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    outstanding_amount = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    txn_id = models.CharField(max_length=20, null=True, blank=True)
    paid = models.BooleanField()

    def __str__(self):
        return "{} - {}".format(self.user.username, self.timestamp)

class Transaction(models.Model):
    # We are extra careful and we save keep track of each individual event that affect the dollar amount a customer owes.
    # For example after we add shots we will create a new instance with the number of new shots imported and the total privacyChoices
    # when a payment occurs we add a new instance (using negative numbers)
    timestamp = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(User)
    shot_count = models.IntegerField()
    videoshot_count = models.IntegerField()
    dollar_amount = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    order = models.OneToOneField(Order, null=True, blank=True) # only payment events will have an associated order

    def __str__(self):
        return "{} - {}".format(self.user.username, self.timestamp)

class RateChange(models.Model):
    timestamp = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(User)
    # Additional items we are interested in for a customer
    shot_rate = models.FloatField()
    videoshot_rate = models.FloatField()

    def __str__(self):
        return "{} - {}".format(self.user.username, self.timestamp)

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, primary_key=True)
    # Additional items we are interested in for a customer
    amount_due = models.FloatField()
    shot_rate = models.FloatField()
    videoshot_rate = models.FloatField()
    outstanding_shots = models.IntegerField()
    outstanding_videoshots = models.IntegerField()

    def __str__(self):
        return "{}".format(self.user.username)
