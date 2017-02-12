import datetime as dt

#from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q

from shot.models import Year, Month, Week, Day, Session, Shot, SessionLabel
from shot.tasks import sony_csv_to_db
from profiles.models import UserProfile, FriendRequest

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
                             AddLabelSerializer, UserProfileSerializer,
                             FriendRequestSerializer, FriendSerializer,
                             SearchUserSerializer, AvatarSerializer,
                             CsvSerializer,
                             ShotGroup, ShotGroupSerializer, InputSerializer, OutputSerializer)

from sony.routines import apply_sonyfilter, SonyShotSetDetail

class UploadCsv(generics.GenericAPIView):
    serializer_class = CsvSerializer
    queryset = []#UserProfile.objects.all()

    def post(self,request):
        serializer = CsvSerializer(data=request.data)
        if serializer.is_valid():
            if 'sonycsv' in serializer.data:
                _handle_csvfile_upload(request.FILES['sonycsv'], request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class UploadAvatar(generics.GenericAPIView):
    serializer_class = AvatarSerializer
    queryset = UserProfile.objects.all()

    def post(self,request):
        serializer = AvatarSerializer(data=request.data)
        if serializer.is_valid():
            profile = request.user.userprofile
            if 'avatar' in serializer.data:
                profile.avatar.delete()
                profile.avatar = request.FILES['avatar']
                profile.save()
            serializer_out = UserProfileSerializer(profile)
            return Response(serializer_out.data, status=status.HTTP_201_CREATED)

class TestUploadView(generics.GenericAPIView):
    serializer_class = UserProfileSerializer
    queryset = UserProfile.objects.all()

    def post(self,request):
        serializer = UserProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)


class SearchUser(generics.GenericAPIView):
    serializer_class = SearchUserSerializer

    def get_queryset(self):
        return UserProfile.objects.all()

    def post(self, request):
        serializer = SearchUserSerializer(data=request.data)
        if serializer.is_valid():
            if 'query' in serializer.data:
                query = serializer.data['query']
                queryset = self.get_queryset()

                QS = Q(user__username__icontains=query)
                QS.add(Q(user__email__icontains=query), Q.OR)
                QS.add(Q(first_name__icontains=query), Q.OR)
                QS.add(Q(last_name__icontains=query), Q.OR)
                QS2 = Q(user__username=request.user.username)
                QS2.add(Q(user__username__in=request.user.userprofile.friends.values_list('user__username', flat=True)),Q.OR)
                QS2.add(Q(user__username__in=request.user.userprofile.requests_out.values_list('to_user__user__username', flat=True)),Q.OR)
                QS2.add(Q(user__username__in=request.user.userprofile.requests_in.values_list('from_user__user__username', flat=True)),Q.OR)

                queryset = queryset.filter(QS).exclude(QS2)

                serializer = SearchUserSerializer(queryset, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class PendingFriendRequests(generics.GenericAPIView):
    serializer_class = FriendRequestSerializer

    def get_queryset(self):
        profile = self.request.user.userprofile
        return FriendRequest.objects.filter(to_user=profile)

    def get(self, request, format=None):
        queryset = self.get_queryset()
        serializer = FriendRequestSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        serializer = FriendRequestSerializer(data=request.data)
        if serializer.is_valid():
            if request.user.username != serializer.data['to_user']:
                return Response({"Error":"Permission denied"}, status=status.HTTP_401_UNAUTHORIZED)
            from_user = get_object_or_404(UserProfile, user__username=serializer.data['from_user'])
            to_user = get_object_or_404(UserProfile, user__username=serializer.data['to_user'])
            friend_request = get_object_or_404(FriendRequest, from_user=from_user, to_user=to_user)
            if serializer.data['action'] == "accept":
                friend_request.accept()
            elif serializer.data['action'] == "refuse":
                friend_request.refuse()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class AddFriend(generics.GenericAPIView):
    queryset = []
    serializer_class = FriendRequestSerializer

    def post(self, request):
        serializer = FriendRequestSerializer(data=request.data)
        if serializer.is_valid():
            if request.user.username != serializer.data['from_user']:
                return Response(serializer.data, status=status.HTTP_401_UNAUTHORIZED)
            from_user = get_object_or_404(UserProfile, user__username=serializer.data['from_user'])
            to_user = get_object_or_404(UserProfile, user__username=serializer.data['to_user'])
            if to_user in from_user.friends.all() or from_user == to_user:
                return Response(serializer.data, status=status.HTTP_200_OK)
            try:
                friend_request = FriendRequest.objects.get(from_user=from_user, to_user=to_user)
            except FriendRequest.DoesNotExist:
                try:
                    friend_request = FriendRequest.objects.get(from_user=to_user, to_user=from_user)
                except FriendRequest.DoesNotExist:
                    friend_request = FriendRequest(from_user=from_user, to_user=to_user)
                    friend_request.save()
            serializer_out = FriendRequestSerializer(friend_request)
            return Response(serializer_out.data, status=status.HTTP_201_CREATED)

class GetFriends(generics.GenericAPIView):
    """
    List all friends profiles
    """
    serializer_class = FriendSerializer

    def get_queryset(self, *args, **kwargs):
        return self.request.user.userprofile.friends.all()

    def get(self, request, format=None):
        queryset = self.get_queryset()
        serializer = FriendSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserProfileView(generics.GenericAPIView):
    """
    List all friends profiles, or create own user profile.
    """
    serializer_class = UserProfileSerializer
    def get(self, request):
        profile = UserProfile.objects.get(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        user = request.user
        try:
            profile = UserProfile.objects.get(user=user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            serializer = UserProfileSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, format=None):
        user = request.user
        profile = get_object_or_404(UserProfile,user=user)
        serializer = UserProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.update(instance=profile, validated_data=serializer.data)
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

# Create your views here.

# @ensure_csrf_cookie
def CsrfView(request):
    if request.method == 'GET':
        data = {}
        return JSONResponse(data=data, status=200)

def TestView_(request):

    if request.method == 'GET':
        data = {'user':str(request.user)}
        return JSONResponse(data=data, status=200)

    elif request.method == 'POST':
        #file_ = request.FILES['file']
        data = JSONParser().parse(request)
        data['user'] = str(request.user)
        return JSONResponse(data, status=200)


class TestView(generics.GenericAPIView):

    def get(self, request, *args, **kwargs):
        data = {'user':str(request.user)}
        return JSONResponse(data=data, status=200)

    def post(self, request, *args, **kwargs):
        #file_ = request.FILES['file']
        #data = JSONParser().parse(request.data)
        data = request.data
        data['user'] = str(request.user)
        return JSONResponse(data=data, status=200)

class AddSessionLabel(generics.GenericAPIView):
    serializer_class = AddLabelSerializer
    def get_queryset(self, *args, **kwargs):
        queryset = SessionLabel.objects.filter(user=self.request.user)
        return queryset

    def post(self, request, *args, **kwargs):
        serializer = AddLabelSerializer(data=request.data)
        if serializer.is_valid():
            label_pk = serializer.validated_data['label_pk']
            session_pk = serializer.validated_data['session_pk']
            action = serializer.validated_data['action']
            #queryset = self.get_queryset()
            try:
                #label = queryset.filter(pk=label_pk)
                label = SessionLabel.objects.get(pk=label_pk, user=request.user)
            except SessionLabel.DoesNotExist:
                serializer.validated_data['success'] = False
                return Response(serializer.data, status=400)
            try:
                session = Session.objects.get(pk=session_pk, user=request.user)
            except Session.DoesNotExist:
                serializer.validated_data['success'] = False
                return Response(serializer.data, status=400)
            if action == 'add':
                session.labels.add(label)
            elif action == 'remove':
                session.labels.remove(label)
            serializer.validated_data['success'] = True
            return Response(serializer.data, status=200)
        else:
            return Response(serializer.errors, status=400)

class ShotsFilter(generics.GenericAPIView):
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
            return Response(filter_serializer.errors, status=400)
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

class SessionList(mixins.ListModelMixin,
                  generics.GenericAPIView):
    #queryset = Day.objects.all()
    serializer_class = SessionSerializer
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        self.queryset = Session.objects.filter(user=requested_user)
        return self.queryset

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

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

def _handle_csvfile_upload(f,user):
    import os
    from tennistat.settings import MEDIA_ROOT
    filename = f.name
    destination_dir = os.path.join(MEDIA_ROOT,'user_'+str(user.pk),'csv_files')
    destination_file = os.path.join(destination_dir,f.name)

    if not os.path.exists(destination_dir):
        os.makedirs(destination_dir)

    with open(destination_file, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
    #shots_results = csv_to_shots_db.apply_async((destination_file,user.pk), queue='db')
    #videos_results = csv_to_videos_db.apply_async((destination_file,user.pk), queue='db')
    import_result = sony_csv_to_db(destination_file, user.pk)
