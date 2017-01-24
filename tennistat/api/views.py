import datetime as dt

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from shot.models import Year, Month, Week, Day, Session, Shot
from api.serializers import (YearSerializer, MonthSerializer,
                             WeekSerializer, DaySerializer, SessionSerializer,
                             ShotSerializer, ShotSetSerializer,
            ShotGroup, ShotGroupSerializer, InputSerializer, OutputSerializer)
from api.objects import SonyShotSetDetail
from django.http import Http404, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, mixins, generics
from rest_framework import serializers

from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser

class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

# Create your views here.

@csrf_exempt
def TestView(request):

    if request.method == 'GET':
        data = {'one field':1, 'another field':[1,2,3]}
        return JSONResponse(data=data)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        try:
            data['a'] += 1
        except Exception:
            pass
        return JSONResponse(data, status=201)

class YearList(mixins.ListModelMixin,
                  generics.GenericAPIView):
    #queryset = Day.objects.all()
    serializer_class = YearSerializer
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        self.queryset = Year.objects.filter(user=requested_user)
        return self.queryset

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

class PeriodDetail(APIView):
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        model_class, serializer_class = _str_to_model_serializer(self.kwargs['period'])
        period_obj = _url_to_object(requested_user, **self.kwargs)
        queryset = period_obj.shots.all()
        return queryset

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset(*args, **kwargs)
        detail_obj = SonyShotSetDetail(queryset)
        serializer = ShotSetSerializer(detail_obj)
        return Response(serializer.data)

class MonthList(mixins.ListModelMixin,
                  generics.GenericAPIView):
    #queryset = Day.objects.all()
    serializer_class = MonthSerializer
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        self.queryset = Month.objects.filter(user=requested_user)
        return self.queryset

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

class WeekList(mixins.ListModelMixin,
                  generics.GenericAPIView):
    #queryset = Day.objects.all()
    serializer_class = WeekSerializer
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        self.queryset = Week.objects.filter(user=requested_user)
        return self.queryset

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

class DayList(mixins.ListModelMixin,
                  generics.GenericAPIView):
    #queryset = Day.objects.all()
    serializer_class = DaySerializer
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        self.queryset = Day.objects.filter(user=requested_user)
        return self.queryset

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    #def post(self, request, *args, **kwargs):
    #    return self.create(request, *args, **kwargs)

class DayList_(APIView):
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        self.queryset = Day.objects.filter(user__username=username)
        return self.queryset

    def get(self, request):
        # Validate the incoming input (provided through query parameters)
        #serializer = IncredibleInputSerializer(data=request.query_params)
        #serializer.is_valid(raise_exception=True)

        # Get the model input
        #data = serializer.validated_data
        #model_input = data["model_input"]
        #nshots = len(self.queryset)
        # Perform the complex calculations
        #complex_result = model_input + "xyz"
        response = DaySerializer(self.queryset,many=True)
        #


        # Return it in your custom format
        #return Response({
        #    "complex_result": complex_result,
        #})
        return Response(response.data)

class PeriodStrokeDetail(APIView):
    def get_queryset(self):
        #self.queryset = Shot.objects.filter(user=self.request.user)
        self.queryset = Shot.objects.all()
        return self.queryset

    def post(self, request, format=None):
        serializer = InputSerializer(data=request.data)
        if serializer.is_valid():
            #response = InputSerializer({"a":1,"b":4})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        #return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        #model_input = data["model_input"]
        #nshots = len(self.queryset)
        # Perform the complex calculations
        #complex_result = model_input + "xyz"
        #shots = ShotGroup(1,7)
        #response = InputSerializer({"a":1,"b":4})
        #


        # Return it in your custom format
        #return Response({
        #    "complex_result": complex_result,
        #})
        #return Response(response.data)

def _str_to_model_serializer(string):
    if string == 'session':
        return Session, SessionSerializer
    elif string == 'day':
        return Day, DaySerializer
    elif string == 'week':
        return Week, WeekSerializer
    elif string == 'month':
        return Month, MonthSerializer
    elif string == 'year':
        return Year, YearSerializer

def _url_to_object(user, period='', year=None, month=None, day=None, hour=None, *args, **kwargs):
    _y = 2016 if year is None else int(year)
    _m = 1 if month is None else int(month)
    _d = 1 if day is None else int(day)
    _h = 0 if hour is None else int(hour)
    try:
        _datetime = dt.datetime(_y, _m, _d, _h, 0, 0)
    except ValueError:
        raise Http404(ValueError("Wrong DateTime Format!"))

    if period =='year':
        obj = get_object_or_404(Year, user=user, timestamp=dt.date(int(year),1,1))

    elif period =='month':
        obj = get_object_or_404(Month, user=user, timestamp=dt.date(int(year),int(month),1))

    elif period =='week':
        d = dt.date(int(year),int(month),int(day))
        w = d - dt.timedelta(days=d.weekday())
        obj = get_object_or_404(Week, user=user, timestamp=w)

    elif period =='day':
        obj =get_object_or_404(Day, user=user, timestamp=dt.date(int(year),int(month),int(day)))

    elif period =='session':
        obj =get_object_or_404(Session, user=user, timestamp=dt.datetime(int(year),int(month),int(day),int(hour)))

    else:
        raise Http404(ValueError("Wrong period: {}".format(kwargs)))

    return obj
