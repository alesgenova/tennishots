from rest_framework import serializers
from sony.constants import SWING_TYPES
from shot.models import Year, Month, Week, Day, Session, SessionLabel, Shot


class SpinRangePickerSerializer(serializers.Serializer):
    min = serializers.IntegerField(min_value=-10, max_value=10,required=False)
    max = serializers.IntegerField(min_value=-10, max_value=10, required=False)

class SpeedRangePickerSerializer(serializers.Serializer):
    min = serializers.FloatField(min_value=0, required=False)
    max = serializers.FloatField(min_value=0, required=False)

class DateRangePickerSerializer(serializers.Serializer):
    min = serializers.DateField(required=False)
    max = serializers.DateField(required=False)

class PeriodPickerSerializer(serializers.Serializer):
    name = serializers.ChoiceField(choices=(("session","Session"),("day","Day"),("week","Week"),("month","Month"),("year","Year"),))
    pks = serializers.ListField(child=serializers.IntegerField(min_value=1))

class SonyFilterListSerializer(serializers.Serializer):
    periods = PeriodPickerSerializer(required=False)
    date_range = DateRangePickerSerializer(required=False)
    swing_speed = SpeedRangePickerSerializer(required=False)
    ball_speed = SpeedRangePickerSerializer(required=False)
    ball_spin = SpinRangePickerSerializer(required=False)
    swing_type = serializers.MultipleChoiceField(choices=SWING_TYPES, required=False)

class SonyFilterSerializer(serializers.Serializer):
    username = serializers.CharField()
    sensor = serializers.ChoiceField(choices=(("SO","Sony"),))
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

class LabelSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    slug = serializers.SlugField(required=False, read_only=True)

    class Meta:
        model = SessionLabel
        fields = ('pk', 'name', 'slug')

class SessionSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    shot_count = serializers.IntegerField(source='shots.count',
                                          read_only=True)
    video_count = serializers.IntegerField(source='videos.count',
                                          read_only=True)
    labels = LabelSerializer(many=True, read_only=True)
    #count = 23
    class Meta:
        model = Session
        fields = ('pk', 'url_name', 'user','timestamp', 'shot_count', 'video_count', 'labels')

class DaySerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    #date = serializers.DateField(source='timestamp.year', read_only=True)
    sessions = SessionSerializer(source='session_set', many=True, read_only=True)
    class Meta:
        model = Day
        fields = ('pk', 'url_name', 'user', 'timestamp', 'sessions')

class WeekSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    shot_count = serializers.IntegerField(source='shots.count',
                                          read_only=True)
    video_count = serializers.IntegerField(source='videos.count',
                                          read_only=True)

    class Meta:
        model = Week
        fields = ('pk', 'user', 'timestamp', 'shot_count', 'video_count')

class MonthSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    shot_count = serializers.IntegerField(source='shots.count',
                                          read_only=True)
    video_count = serializers.IntegerField(source='videos.count',
                                          read_only=True)

    class Meta:
        model = Month
        fields = ('pk', 'user', 'timestamp', 'shot_count', 'video_count')

class YearSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(read_only=True)
    shot_count = serializers.IntegerField(source='shots.count',
                                          read_only=True)
    video_count = serializers.IntegerField(source='videos.count',
                                          read_only=True)

    class Meta:
        model = Year
        fields = ('pk', 'user', 'timestamp', 'shot_count', 'video_count')

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
