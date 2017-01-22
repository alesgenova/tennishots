from rest_framework import serializers
from shot.models import Day

class DaySerializer(serializers.ModelSerializer):

    class Meta:
        model = Day
        fields = ['timestamp','session_set','shot_set']
