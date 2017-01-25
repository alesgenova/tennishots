from rest_framework import serializers
from shot.models import Year, Month, Week, Day, Session, SessionLabel, Shot


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

    class Meta:
        model = SessionLabel
        fields = ('pk', 'user', 'name','slug')

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
