from rest_framework import serializers
from rest_auth.serializers import UserDetailsSerializer
from generic.constants import PERIODS, SENSORS
from sony.constants import SWING_TYPES
from profiles.models import UserProfile, FriendRequest
from customers.models import CustomerProfile, Order
from shot.models import Year, Month, Week, Day, Session, SessionLabel, Shot
from video.models import VideoSource, VideoCollection

class OrderSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = ["user", "amount", "pk"]


class CustomerProfileSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = CustomerProfile
        fields = ["user", "amount_due", "trial_end", "shot_rate", "videoshot_rate", "outstanding_shots", "outstanding_videoshots"]

class LastChangeSerializer(serializers.Serializer):
    user = serializers.CharField()
    lastchange = serializers.DateTimeField()

class VideoCollectionSerializer(serializers.ModelSerializer):
    shot_count = serializers.IntegerField(source='videoshots.count',
                                      read_only=True)
    class Meta:
        model = VideoCollection
        fields = ["pk", "timestamp", "title", "description", "shot_count", "processed_file", "status", "thumbnail"]

class VideoRetrySerializer(serializers.Serializer):
    model = serializers.CharField()
    pk = serializers.IntegerField(min_value=1)

class VideoUploadSerializer(serializers.Serializer):
    videofile = serializers.FileField(max_length=None, required=False, use_url=True)

class VideoSourceSerializer(serializers.ModelSerializer):
    shot_count = serializers.IntegerField(source='videoshots.count',
                                          read_only=True)
    class Meta:
        model = VideoSource
        fields = ["pk", "timestamp", "filename", "shot_count", "processed_file", "status", "thumbnail"]

class SonyProgressSerializer(serializers.Serializer):
    swing_speed = serializers.SlugField()
    ball_speed = serializers.CharField()
    ball_spin = serializers.CharField()

class CsvSerializer(serializers.Serializer):
    sonycsv = serializers.FileField(max_length=None, required=False, use_url=True)


class AvatarSerializer(serializers.Serializer):
    avatar = serializers.ImageField(max_length=None, required=False, use_url=True)


class SearchUserSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    query = serializers.CharField(min_length=3, required=False)
    avatar = serializers.ImageField(max_length=None, required=False, read_only=True, use_url=True)

    class Meta:
        model = UserProfile
        fields = ['first_name','last_name', 'user', 'email', 'avatar', 'query']


class FriendSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    avatar = serializers.ImageField(max_length=None, required=False, read_only=True, use_url=True)
    class Meta:
        model = UserProfile
        fields = ['first_name','last_name', 'user', 'email', 'avatar']

class FriendRequestSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    from_user = serializers.CharField()
    to_user = serializers.CharField()
    action = serializers.CharField(required=False)
    from_first_name = serializers.CharField(source="from_user.first_name",read_only=True)
    from_last_name = serializers.CharField(source="from_user.last_name",read_only=True)
    from_email = serializers.CharField(source="from_user.user.email",read_only=True)
    from_avatar = serializers.ImageField(source="from_user.avatar", max_length=None, required=False, read_only=True, use_url=True)
    #success = serializers.BooleanField(read_only=True)
    #from_profile = FriendSerializer(source="from_user", required=False, read_only=True)

    class Meta:
        model = FriendRequest
        fields = ["pk", "from_user", "to_user", "action", "from_first_name", "from_last_name", "from_email", "from_avatar"]#, "success", "from_profile"]

class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    friends = FriendSerializer(required=False, read_only=True, many=True)
    avatar = serializers.ImageField(max_length=None, required=False, read_only=True, use_url=True)

    class Meta:
        model = UserProfile
        fields = ['user','first_name','last_name', 'arm', 'units', 'backhand', 'privacy', 'friends', 'avatar']

class AddLabelSerializer(serializers.Serializer):
    label_pk = serializers.IntegerField(min_value=1)
    session_pk = serializers.IntegerField(min_value=1)
    action = serializers.ChoiceField(choices=(("add","Add Label"),("remove","Remove Label")))
    success = serializers.BooleanField(required=False)

class DateSerializer(serializers.Serializer):
    year = serializers.IntegerField()
    month = serializers.IntegerField(min_value=1, max_value=12)
    day = serializers.IntegerField(min_value=1, max_value=31)

class DateRangePickerSerializer(serializers.Serializer):
    min = DateSerializer(required=False)
    max = DateSerializer(required=False)

class PeriodPickerSerializer(serializers.Serializer):
    name = serializers.ChoiceField(choices=PERIODS)
    pks = serializers.ListField(child=serializers.IntegerField(min_value=1))

class SonyFilterListSerializer(serializers.Serializer):
    periods = PeriodPickerSerializer(required=False)
    date_range = DateRangePickerSerializer(required=False)
    swing_speed = serializers.ListField(child=serializers.IntegerField(min_value=0), required=False)
    ball_speed = serializers.ListField(child=serializers.IntegerField(min_value=0), required=False)
    ball_spin = serializers.ListField(child=serializers.IntegerField(min_value=-10, max_value=10), required=False)
    labels = serializers.ListField(child=serializers.IntegerField(min_value=1))
    swing_type = serializers.MultipleChoiceField(choices=SWING_TYPES, required=False)

class SonyFilterSerializer(serializers.Serializer):
    username = serializers.CharField()
    sensor = serializers.ChoiceField(choices=SENSORS)
    imperial_units = serializers.BooleanField()
    filters = SonyFilterListSerializer(required=False)

class ShotSetSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    sensor = serializers.CharField()
    imperial_units = serializers.BooleanField()
    strokes = serializers.ListField()
    #strokes = SonyStrokeSerializer(many=True)

class ShotSerializer(serializers.ModelSerializer):

    class Meta:
        model = Shot
        fields = ['timestamp', 'sensor']

class ShotFilterSerializer(serializers.Serializer):
    pass


class CreateVideoCollectionSerializer(serializers.Serializer):
    sonyfilter = SonyFilterSerializer()
    title = serializers.CharField(max_length=20)
    description = serializers.CharField(max_length=200)


class LabelSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    slug = serializers.SlugField(required=False, read_only=True)
    session_count = serializers.IntegerField(source="sessions.count",required=False, read_only=True)

    class Meta:
        model = SessionLabel
        fields = ('pk', 'name', 'slug', 'category', 'session_count')

class SessionSerializerPlusPlus(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    shot_count = serializers.IntegerField(source='shots.count',
                                          read_only=True)
    video_count = serializers.IntegerField(source='videos.count',
                                          read_only=True)
    videoshot_count = serializers.IntegerField(source='get_videoshot_count',
                                          read_only=True)
    labels = LabelSerializer(many=True, read_only=True)
    videos = VideoSourceSerializer(many=True, read_only=True)
    #player = FriendSerializer(source="user.userprofile", read_only=True)
    #count = 23
    class Meta:
        model = Session
        fields = ('pk', 'timestamp', 'shot_count', 'video_count', 'videoshot_count', 'labels', 'videos')#, 'player')

class SessionSerializerPlus(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    shot_count = serializers.IntegerField(source='shots.count',
                                          read_only=True)
    video_count = serializers.IntegerField(source='videos.count',
                                          read_only=True)
    labels = LabelSerializer(many=True, read_only=True)
    player = FriendSerializer(source="user.userprofile", read_only=True)
    #count = 23
    class Meta:
        model = Session
        fields = ('pk', 'timestamp', 'shot_count', 'video_count', 'labels', 'player')

class SessionSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    shot_count = serializers.IntegerField(source='shots.count',
                                          read_only=True)
    video_count = serializers.IntegerField(source='videos.count',
                                          read_only=True)
    videoshot_count = serializers.IntegerField(source='get_videoshot_count',
                                          read_only=True)
    labels = LabelSerializer(many=True, read_only=True)
    #count = 23
    class Meta:
        model = Session
        fields = ('pk', 'timestamp', 'shot_count', 'video_count', 'videoshot_count', 'labels')

class DaySerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    #timestamp = serializers.DateField(source='timestamp.year', read_only=True)
    sessions = SessionSerializer(source='sessions', many=True, read_only=True)
    timestamp = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    class Meta:
        model = Day
        fields = ('pk', 'timestamp', 'sessions')

class WeekSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    session_count = serializers.IntegerField(source='sessions.count',
                                          read_only=True)
    shot_count = serializers.IntegerField(source='shots.count',
                                          read_only=True)
    video_count = serializers.IntegerField(source='videos.count',
                                          read_only=True)
    videoshot_count = serializers.IntegerField(source='get_videoshot_count',
                                        read_only=True)
    timestamp = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = Week
        fields = ('pk', 'timestamp', 'session_count', 'shot_count', 'video_count', 'videoshot_count')

class MonthSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    shot_count = serializers.IntegerField(source='shots.count',
                                          read_only=True)
    video_count = serializers.IntegerField(source='videos.count',
                                          read_only=True)
    videoshot_count = serializers.IntegerField(source='get_videoshot_count',
                                        read_only=True)
    timestamp = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = Month
        fields = ('pk', 'timestamp', 'shot_count', 'video_count', 'videoshot_count')

class YearSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    shot_count = serializers.IntegerField(source='shots.count',
                                          read_only=True)
    video_count = serializers.IntegerField(source='videos.count',
                                          read_only=True)
    videoshot_count = serializers.IntegerField(source='get_videoshot_count',
                                        read_only=True)
    timestamp = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = Year
        fields = ('pk', 'timestamp', 'shot_count', 'video_count', 'videoshot_count')

class SwingSerializer(serializers.Serializer):
    count_week = serializers.IntegerField()
    count_overall = serializers.IntegerField()
    percentiles_week = serializers.ListField(child=serializers.IntegerField(), required=False)
    percentiles_overall = serializers.ListField(child=serializers.IntegerField(), required=False)
    #fastest_week = serializers.IntegerField(required=False)
    #fastest_overall = serializers.IntegerField(required=False)
    #above_week = serializers.IntegerField(required=False)
    #above_overall = serializers.IntegerField(required=False)

class SummarySerializer(serializers.Serializer):
    FH = SwingSerializer()
    BH = SwingSerializer()
    FS = SwingSerializer()
    BS = SwingSerializer()
    FV = SwingSerializer()
    BV = SwingSerializer()
    SE = SwingSerializer()
    SM = SwingSerializer()

class UserPeriodsListSerializer(serializers.Serializer):
    session = SessionSerializerPlusPlus(many=True)
    week = WeekSerializer(many=True)
    month = MonthSerializer(many=True)
    year = YearSerializer(many=True)

class PlayerProfileSerializer(serializers.Serializer):
    user = serializers.CharField()
    lastchange = serializers.DateTimeField()
    labels = LabelSerializer(many=True)
    periods = UserPeriodsListSerializer()
    collections = VideoCollectionSerializer(many=True)
    shot_count = serializers.IntegerField()
    videoshot_count = serializers.IntegerField()
    recording_count = serializers.IntegerField()
    collection_count = serializers.IntegerField()

class ShotGroup(object):
    def __init__(self, num1, num2):
        self.result = num1 + num2

class ShotGroupSerializer(serializers.Serializer):
    result = serializers.IntegerField()

class InputSerializer(serializers.Serializer):
    a = serializers.IntegerField()
    b = serializers.IntegerField()
    result = serializers.IntegerField(required=False)

class OutputSerializer(serializers.Serializer):
    result = serializers.IntegerField()
