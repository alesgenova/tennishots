from django.db import models
from django.contrib.auth.models import User
from django.template.defaultfilters import slugify

from sony.constants import SWING_TYPES
from generic.constants import SENSORS

# Create your models here.

# All the timeperiods (year, month, week, day, session)

class Period(models.Model):
    timestamp = models.DateTimeField()
    url_name = models.CharField(max_length=20)

    def get_videoshot_count(self):
        return self.shots.filter(videoshot__isnull=False).count()

class Year(Period):
    user = models.ForeignKey(User, related_name='years', on_delete=models.CASCADE, null=False)

    def __str__(self):
        return str(self.timestamp.year)

    def save(self, *args, **kwargs):
        self.url_name = "year/{}".format(self.timestamp.year)
        super(Year, self).save(*args, **kwargs)

class Month(Period):
    user = models.ForeignKey(User, related_name='months', on_delete=models.CASCADE, null=False)
    yy = models.ForeignKey(Year, on_delete=models.CASCADE)

    def __str__(self):
        return '{}/{}'.format(self.timestamp.year, self.timestamp.month)

    def save(self, *args, **kwargs):
        self.url_name = "month/{}/{}".format(self.timestamp.year, self.timestamp.month)
        super(Month, self).save(*args, **kwargs)

class Week(Period):
    user = models.ForeignKey(User, related_name='weeks', on_delete=models.CASCADE, null=False)

    def __str__(self):
        return '{}/{}/{}'.format(self.timestamp.year, self.timestamp.month, self.timestamp.day)

    def save(self, *args, **kwargs):
        self.url_name = "week/{}/{}/{}".format(self.timestamp.year, self.timestamp.month, self.timestamp.day)
        super(Week, self).save(*args, **kwargs)

class Day(Period):
    user = models.ForeignKey(User, related_name='days', on_delete=models.CASCADE, null=False)
    mm = models.ForeignKey(Month, on_delete=models.CASCADE)
    ww = models.ForeignKey(Week, on_delete=models.CASCADE)

    def __str__(self):
        return '{}/{}/{}'.format(self.timestamp.year, self.timestamp.month, self.timestamp.day)

    def save(self, *args, **kwargs):
        self.url_name = "day/{}/{}/{}".format(self.timestamp.year, self.timestamp.month, self.timestamp.day)
        super(Day, self).save(*args, **kwargs)

class SessionLabel(models.Model):
    category_choices = ((0,'Surface'),
                        (1, 'Opponent'),
                        (2, 'Game type'),
                        (3, 'Competition'),
                        (4, 'Condition'),
                        (5, 'Other'))

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=20)
    category = models.IntegerField(choices=category_choices, default=5)
    slug = models.SlugField()

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        try:
            SessionLabel.objects.get(user=self.user, slug=self.slug)
        except SessionLabel.DoesNotExist:
            super(SessionLabel, self).save(*args, **kwargs)

    class Meta:
        unique_together = (('user','slug'))

class Session(Period):
    user = models.ForeignKey(User, related_name='sessions', on_delete=models.CASCADE, null=False)
    dd = models.ForeignKey(Day, on_delete=models.CASCADE)
    labels = models.ManyToManyField(SessionLabel)

    def __str__(self):
        return '{}/{}/{}/{}'.format(self.timestamp.year, self.timestamp.month, self.timestamp.day, self.timestamp.hour)

    def save(self, *args, **kwargs):
        self.url_name = "session/{}/{}/{}/{}".format(self.timestamp.year, self.timestamp.month, self.timestamp.day, self.timestamp.hour)
        super(Session, self).save(*args, **kwargs)

# The shot models (Sony, )
class Shot(models.Model):
    timestamp = models.DateTimeField()
    user = models.ForeignKey(User, related_name='shots', on_delete=models.CASCADE)

    day = models.ForeignKey(Day, related_name='shots', on_delete=models.CASCADE)
    session = models.ForeignKey(Session, related_name='shots', on_delete=models.CASCADE)
    week = models.ForeignKey(Week, related_name='shots', on_delete=models.CASCADE)
    month = models.ForeignKey(Month, related_name='shots', on_delete=models.CASCADE)
    year = models.ForeignKey(Year, related_name='shots', on_delete=models.CASCADE)

    sensor = models.CharField(max_length=2, choices=SENSORS)

    def __str__(self):
        return "{} - {}".format(self.user, self.timestamp)

class SonyData(models.Model):
    shot = models.OneToOneField(Shot, related_name='data', on_delete=models.CASCADE, primary_key=True)
    swing_type = models.CharField(max_length=2, choices=SWING_TYPES)
    swing_speed = models.FloatField()
    ball_speed = models.FloatField()
    ball_spin = models.IntegerField()
    impact_position = models.IntegerField()
