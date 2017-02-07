from django.db import models
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
import io
from PIL import Image, ImageOps

# Create your models here.

def avatar_user_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'user_{0}/avatar/{1}'.format(instance.user.id, filename)

class UserProfile(models.Model):
    arm_choices = (('L','Left-handed'),
                   ('R', 'Right-handed'),)
    unit_choices = (('M','Imperial Units'),
                   ('K', 'Metric Units'),)
    backhand_choices = ((1,'One-handed'),
                   (2, 'Two-handed'),)

    privacy_choices = (('VF', 'Visible to friends'),
                       ('PR', 'Private'),
                       ('VR', 'Visible to registered users'),
                       ('PU', 'Public'),
                      )

    #
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=20, null=True, blank=True)
    # One to one mapping between a user and its profile
    user = models.OneToOneField(User, primary_key=True)
    # Additional items we are interested in for a player
    avatar = models.ImageField(upload_to=avatar_user_path, null=True, blank=True)
    arm = models.CharField(max_length=1, choices=arm_choices)
    units = models.CharField(max_length=1, choices=unit_choices)
    backhand = models.IntegerField(choices=backhand_choices)
    privacy = models.CharField(max_length=2, choices=privacy_choices)

    friends = models.ManyToManyField("self")

    def save(self, *args, **kwargs):
        try:
            temp_name = self.avatar.name
            image_obj = Image.open(self.avatar)
            # ImageOps compatible mode
            if image_obj.mode not in ("L", "RGB"):
                image_obj = image_obj.convert("RGB")
            imagefit = ImageOps.fit(image_obj, (500, 500), Image.ANTIALIAS)
            img_io = io.BytesIO()
            imagefit.save(img_io, 'PNG')
            self.avatar.delete(save=False)
            self.avatar.save(temp_name,
                        content=ContentFile(img_io.getvalue()),
                        save=False)
        except Exception:
            pass
        super(UserProfile, self).save(*args, **kwargs)

    def __str__(self):
        return "{}".format(self.user.username)

class FriendRequest(models.Model):
    from_user = models.ForeignKey(UserProfile, related_name="requests_out", on_delete=models.CASCADE)
    to_user = models.ForeignKey(UserProfile, related_name="requests_in", on_delete=models.CASCADE)
    #status = models.CharField(max_length=2, choices=(('PE','Pending'),('RE','Refused'),('AC','Accepted')))

    def accept(self):
        self.from_user.friends.add(self.to_user)
        self.delete()

    def refuse(self):
        self.delete()

    def __str__(self):
        return "{} -> {}".format(self.from_user.user.username, self.to_user.user.username)
