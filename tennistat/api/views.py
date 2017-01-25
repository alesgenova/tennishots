import datetime as dt

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from shot.models import Year, Month, Week, Day, Session, Shot, SessionLabel

from django.http import Http404, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, mixins, generics
from rest_framework import serializers

from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser

from generic.routines import str_to_periodmodel, url_to_object
from api.serializers import (YearSerializer, MonthSerializer,
                             WeekSerializer, DaySerializer, SessionSerializer,
                             ShotSerializer, ShotSetSerializer,
                             LabelSerializer, SonyFilterSerializer,
            ShotGroup, ShotGroupSerializer, InputSerializer, OutputSerializer)

from sony.routines import apply_sonyfilter, SonyShotSetDetail

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

class ShotsFromPeriods(generics.GenericAPIView):
    serializer_class = SonyFilterSerializer
    def get_queryset(self, filter_serializer, *args, **kwargs):
        username = filter_serializer.validated_data['username']
        requested_user = get_object_or_404(User, username=username)
        queryset = apply_sonyfilter(filter_serializer.validated_data)
        return queryset

    def post(self, request, *args, **kwargs):
        filter_serializer = SonyFilterSerializer(data=request.data)
        if filter_serializer.is_valid():
            queryset = self.get_queryset(filter_serializer, *args, **kwargs)
            detail_obj = SonyShotSetDetail(queryset)
            summary_serializer = ShotSetSerializer(detail_obj)
            return Response(summary_serializer.data, status=200)
        else:
            return Response(filter_serializer.errors)
        #return JSONResponse(self.kwargs, status=201)

class LabelList(mixins.ListModelMixin,
                  mixins.CreateModelMixin,
                  generics.GenericAPIView):
    serializer_class = LabelSerializer
    def get_queryset(self, *args, **kwargs):
        queryset = SessionLabel.objects.filter(user__username=self.kwargs['username'])
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

#class SnippetDetail(mixins.RetrieveModelMixin,
#                    mixins.UpdateModelMixin,
#                    mixins.DestroyModelMixin,
#                    generics.GenericAPIView):
#    queryset = Snippet.objects.all()
#    serializer_class = SnippetSerializer
#
#    def get(self, request, *args, **kwargs):
#        return self.retrieve(request, *args, **kwargs)
#
#    def put(self, request, *args, **kwargs):
#        return self.update(request, *args, **kwargs)
#
#    def delete(self, request, *args, **kwargs):
#        return self.destroy(request, *args, **kwargs)

class PeriodDetail(APIView):
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        model_class = _str_to_periodmodel(self.kwargs['period'])
        period_obj = _url_to_object(requested_user, **self.kwargs)
        queryset = period_obj.shots.all()
        return queryset

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset(*args, **kwargs)
        detail_obj = SonyShotSetDetail(queryset)
        serializer = ShotSetSerializer(detail_obj)
        return Response(serializer.data)


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
