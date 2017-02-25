from django.db import models
from django.contrib.auth.models import User
from shot.models import Year, Month, Week, Day, Session, Shot
import datetime as dt

# Create your models here.
def vsource_user_orig_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'user_{0}/video_sources/original/{1}'.format(instance.user.id, filename)

def vsource_user_proc_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'user_{0}/video_sources/processed/{1}'.format(instance.user.id, filename)

def vclip_user_proc_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'user_{0}/video_clips/{1}'.format(instance.user.id, filename)

class VideoSource(models.Model):
    STATUS_CHOICES = ( ("U", "Upload"),
                       ("P", "Processing"),
                       ("F", "Failed"),
                       ("C", "Complete") )
    filename = models.CharField(max_length=100, null=True, blank=True)
    timestamp = models.DateTimeField(blank=True)
    thumbnail = models.ImageField(upload_to=vsource_user_proc_path, null=True, blank=True)
    original_file = models.FileField(null=True, blank=True)
    processed_file = models.FileField(upload_to=vsource_user_proc_path, null=True, blank=True)
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='U', blank=True)
    duration = models.DurationField(null=True, blank=True)
    year = models.ForeignKey(Year, related_name='videos', on_delete=models.CASCADE, null=True, blank=True)
    month = models.ForeignKey(Month, related_name='videos', on_delete=models.CASCADE, null=True, blank=True)
    week = models.ForeignKey(Week, related_name='videos', on_delete=models.CASCADE, null=True, blank=True)
    day = models.ForeignKey(Day, related_name='videos', on_delete=models.CASCADE, null=True, blank=True)
    session = models.ForeignKey(Session, related_name='videos', on_delete=models.CASCADE, null=True, blank=True)
    task_id = models.CharField(max_length=100, null=True, blank=True)
    user = models.ForeignKey(User, related_name='videos', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return "{} - {}".format(self.user.username, self.filename)

class VideoShot(models.Model):

    shot = models.OneToOneField(Shot, primary_key=True)
    video = models.ForeignKey(VideoSource, related_name='videoshots', on_delete=models.CASCADE)
    seconds = models.IntegerField()
    user = models.ForeignKey(User, related_name='videoshots', on_delete=models.CASCADE)


class VideoCollection(models.Model):
    STATUS_CHOICES = ( ("P", "Processing"),
                       ("F", "Failed"),
                       ("C", "Complete") )
    timestamp = models.DateTimeField()
    title = models.CharField(max_length=20, default='')
    description = models.TextField(max_length=200, default='')
    thumbnail = models.ImageField(upload_to=vclip_user_proc_path, null=True, blank=True)
    processed_file = models.FileField(upload_to=vsource_user_proc_path, null=True, blank=True)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P', blank=True)
    videoshots = models.ManyToManyField(VideoShot)
    task_id = models.CharField(max_length=100, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return "{} - {}".format(self.user.username, self.title)
