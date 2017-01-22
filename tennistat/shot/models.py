from django.db import models
from django.contrib.auth.models import User
from django.template.defaultfilters import slugify

# Create your models here.

# All the timeperiods (year, month, week, day, session)

class Period(models.Model):
    timestamp = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)

class Year(Period):
    pass

    def __str__(self):
        return str(self.timestamp.year)

class Month(Period):
    yy = models.ForeignKey(Year, on_delete=models.CASCADE)

    def __str__(self):
        return '{}/{}'.format(self.timestamp.year, self.timestamp.month)

class Week(Period):
    pass

    def __str__(self):
        return '{}/{}/{}'.format(self.timestamp.year, self.timestamp.month, self.timestamp.day)

class Day(Period):
    mm = models.ForeignKey(Month, on_delete=models.CASCADE)
    ww = models.ForeignKey(Week, on_delete=models.CASCADE)

    def __str__(self):
        return '{}/{}/{}'.format(self.timestamp.year, self.timestamp.month, self.timestamp.day)

class Session(Period):
    dd = models.ForeignKey(Day, on_delete=models.CASCADE)

    def __str__(self):
        return '{}/{}/{}/{}'.format(self.timestamp.year, self.timestamp.month, self.timestamp.day, self.timestamp.hour)

# The shot models (Sony, )
class Shot(models.Model):
    SENSOR_CHOICES = (
                        ('SO', 'Sony'),
                     )
    timestamp = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    day = models.ForeignKey(Day, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    week = models.ForeignKey(Week, on_delete=models.CASCADE)
    month = models.ForeignKey(Month, on_delete=models.CASCADE)
    year = models.ForeignKey(Year, on_delete=models.CASCADE)

    sensor = models.CharField(max_length=2, choices=SENSOR_CHOICES)

    def __str__(self):
        return "{} - {}".format(self.user, self.timestamp)

class SonyData(models.Model):
    SWING_TYPES_ = (
            ('FH', 'FOREHAND_SPIN_FLAT'),
            ('BH', 'BACKHAND_SPIN_FLAT'),
            ('FS', 'FOREHAND_SLICE'),
            ('BS', 'BACKHAND_SLICE'),
	        ('FV', 'FOREHAND_VOLLEY'),
            ('BV', 'BACKHAND_VOLLEY'),
            ('SM', 'SMASH'),
            ('SE', 'SERVE'),
            )
    SWING_TYPES = (
            ('FH', 'Forehand'),
            ('BH', 'Backhand'),
            ('FS', 'Forehand Slice'),
            ('BS', 'Backhand Slice'),
	        ('FV', 'Forehand Volley'),
            ('BV', 'Backhand Volley'),
            ('SM', 'Smash'),
            ('SE', 'Serve'),
            )
    shot = models.OneToOneField(Shot, on_delete=models.CASCADE, primary_key=True)
    swing_type = models.CharField(max_length=2, choices=SWING_TYPES)
    swing_speed = models.FloatField()
    ball_speed = models.FloatField()
    ball_spin = models.IntegerField()
    impact_position = models.IntegerField()

class SessionLabel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session = models.ManyToManyField(Session)
    name = models.CharField(max_length=20)
    slug = models.SlugField()

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(test, self).save(*args, **kwargs)
