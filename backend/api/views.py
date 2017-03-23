import datetime as dt

import numpy as np

#from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone

from shot.models import Year, Month, Week, Day, Session, Shot, SessionLabel
from shot.tasks import sony_csv_to_db
from video.models import VideoSource, VideoCollection, VideoShot
from profiles.models import UserProfile, FriendRequest
from customers.models import CustomerProfile, RateChange, Order

from django.http import Http404, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, mixins, generics
from rest_framework import serializers
from rest_framework import permissions

from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser

from django_celery_results.models import TaskResult

from generic.routines import str_to_periodmodel, url_to_object
from api.serializers import (YearSerializer, MonthSerializer,
                             WeekSerializer, DaySerializer, SessionSerializer,
                             ShotSerializer, ShotSetSerializer,
                             LabelSerializer, SonyFilterSerializer,
                             AddLabelSerializer, UserProfileSerializer,
                             FriendRequestSerializer, FriendSerializer,
                             SearchUserSerializer, AvatarSerializer,
                             CsvSerializer, SessionSerializerPlus,
                             SessionSerializerPlusPlus, PlayerProfileSerializer,
                             SonyProgressSerializer, VideoSourceSerializer,
                             VideoUploadSerializer, VideoRetrySerializer,
                             VideoCollectionSerializer, CreateVideoCollectionSerializer,
                             LastChangeSerializer, SummarySerializer,
                             CustomerProfileSerializer, OrderSerializer,
                             ShotGroup, ShotGroupSerializer, InputSerializer, OutputSerializer)

from api.permissions import is_owner_or_friend, is_owner

from sony.routines import apply_sonyfilter, SonyShotSetDetail
from sony.boxplot import box_plot



class MakeOrderView(generics.GenericAPIView):
    """
    Retrieve the last order of the user. If the order has been paid, create a new order.
    If it wasn't paid, update the order to reflect the latest amounts.
    """
    serializer_class = OrderSerializer
    def get(self, request, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner(self.request, username)
        user_orders = Order.objects.filter(user=requested_user)
        customer = requested_user.customerprofile
        if len(user_orders) > 0:
            order = user_orders.order_by("-timestamp")[0]
            if not order.paid and order.txn_id is None:
                pass
            else:
                order = Order()
        else:
            order = Order()
        order.timestamp = timezone.now()
        order.user = requested_user
        order.shots = customer.outstanding_shots
        order.videoshots = customer.outstanding_videoshots
        order.amount = customer.amount_due
        order.outstanding_amount = customer.amount_due
        order.paid_amount = 0.0
        order.paid = False
        order.txn_ide = ""
        order.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CustomerProfileView(generics.GenericAPIView):
    """
    List all friends profiles, or create own user profile.
    """
    serializer_class = CustomerProfileSerializer
    def get(self, request, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner(self.request, username)
        customer_profile = requested_user.customerprofile
        serializer = CustomerProfileSerializer(customer_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SummaryView(generics.GenericAPIView):
    """
    List all friends profiles, or create own user profile.
    """
    serializer_class = SummarySerializer
    def get(self, request, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner_or_friend(self.request, username)
        summary = {}
        summary['user'] = username
        if requested_user.shots.count() == 0:
            last_week = requested_user
        else:
            last_week = requested_user.weeks.latest(field_name='timestamp')
        for swing in ['FH', 'BH', 'FS', 'BS', 'FV', 'BV','SE','SM']:
            summary[swing] = {}
            shots = requested_user.shots.filter(data__swing_type=swing)
            week_shots = last_week.shots.filter(data__swing_type=swing)
            count_week = week_shots.count()
            count_overall = shots.count()
            summary[swing]['count_overall'] = count_overall
            summary[swing]['count_week'] = count_week
            if swing in ['FH', 'BH', 'SE']:
                percentiles = [50,75,90,100]
                percentiles_overall = [-1, -1, -1, -1]
                percentiles_week = [-1, -1, -1, -1]
                if count_overall > 0:
                    percentiles_overall = np.percentile(shots.values_list('data__ball_speed', flat=True), percentiles)
                    if count_week > 0:
                        percentiles_week = np.percentile(week_shots.values_list('data__ball_speed', flat=True), percentiles)
                summary[swing]['percentiles_overall'] = percentiles_overall
                summary[swing]['percentiles_week'] = percentiles_week


        #for swing, threshold in zip(['FH', 'BH', 'SE'],[105,105,145]):
        #    summary[swing]['fastest_overall'] = -1
        #    summary[swing]['fastest_week'] = -1
        #    summary[swing]['above_overall'] = -1
        #    summary[swing]['above_week'] = -1
        #    shots = requested_user.shots.filter(data__swing_type=swing)
        #    week_shots = last_week.shots.filter(data__swing_type=swing)
        #    if (shots.count() > 0):
        #        summary[swing]['fastest_overall'] = max(shots.values_list('data__swing_speed', flat=True))
        #        summary[swing]['above_overall'] = shots.filter(data__swing_speed__gte=threshold).count()
        #        if (week_shots.count() > 0):
        #            summary[swing]['fastest_week'] = max(week_shots.values_list('data__swing_speed', flat=True))
        #            summary[swing]['above_week'] = week_shots.filter(data__swing_speed__gte=threshold).count()

        serializer = SummarySerializer(summary)
        return Response(serializer.data, status=status.HTTP_200_OK)

class LastChanges(generics.GenericAPIView):
    """
    List the last changes for the user and all of its friends, so that a deep refresh of the data can be triggered in the frontend.
    """
    serializer_class = LastChangeSerializer
    queryset = []
    def get(self, request):
        user = request.user
        friends = user.userprofile.friends.all()
        lastchanges = []
        last_dict = {}
        lastchanges.append({"user":user.username, "lastchange":user.userprofile.last_change})
        for friend in friends:
            lastchanges.append({"user":friend.user.username, "lastchange":friend.last_change})
        serializer = LastChangeSerializer(lastchanges, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PlayerProfileView(generics.GenericAPIView):
    """
    List all friends profiles, or create own user profile.
    """
    serializer_class = PlayerProfileSerializer
    def get(self, request, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner_or_friend(self.request, username)
        self._check_failed_videos(requested_user)
        player_profile = {}
        player_profile['user'] = username
        player_profile['lastchange'] = requested_user.userprofile.last_change
        player_profile['shot_count'] = requested_user.shots.count()
        player_profile['videoshot_count'] = requested_user.videoshots.count()
        player_profile['recording_count'] = requested_user.videos.count()
        player_profile['collection_count'] = requested_user.collections.count()
        player_profile['periods'] = {}
        player_profile['periods']['session'] = requested_user.sessions.all().order_by('-timestamp')
        player_profile['periods']['week'] = requested_user.weeks.all().order_by('-timestamp')
        player_profile['periods']['month'] = requested_user.months.all().order_by('-timestamp')
        player_profile['periods']['year'] = requested_user.years.all().order_by('-timestamp')
        player_profile['collections'] = requested_user.collections.all().order_by('-timestamp')
        player_profile['labels'] = requested_user.labels.all().order_by('category')
        serializer = PlayerProfileSerializer(player_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _check_failed_videos(self,user):
        check_flag = 0
        video_collections = VideoCollection.objects.filter(user=user)
        video_sources = VideoSource.objects.filter(user=user)
        if len(video_collections) > 0:
            for video in video_collections:
                if video.status == 'P':
                    try:
                        status = TaskResult.objects.get(task_id=video.task_id).status
                        if status == 'FAILURE':
                            video.status = 'F'
                            video.save()
                            check_flag += 1
                    except Exception:
                        pass
        if len(video_sources) > 0:
            for video in video_collections:
                if video.status == 'P':
                    try:
                        status = TaskResult.objects.get(task_id=video.task_id).status
                        if status == 'FAILURE':
                            video.status = 'F'
                            video.save()
                            check_flag += 1
                    except Exception:
                        pass
        if check_flag > 0:
            profile = user.userprofile
            profile.last_change = timezone.now()
            profile.save()


class CreateVideoCollection(generics.GenericAPIView):
    serializer_class = CreateVideoCollectionSerializer
    def get_queryset(self, sonyfilter, *args, **kwargs):
        username = sonyfilter['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner(self.request, username)
        # apply_sonyfilter
        queryset = apply_sonyfilter(sonyfilter, video_only=True)
        return queryset

    def post(self, request, *args, **kwargs):
        serializer = CreateVideoCollectionSerializer(data=request.data)
        if serializer.is_valid():
            queryset = self.get_queryset(serializer.validated_data['sonyfilter'], *args, **kwargs)
            if queryset.count() > 100:
                return Response({"message":'too many shots'}, status=status.HTTP_200_Ok)
            title = serializer.validated_data['title']
            description = serializer.validated_data['description']
            videocollection = _handle_videocollection_create(request.user, queryset, title, description)
            serializer_out = VideoCollectionSerializer(videocollection)
            return Response(serializer_out.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShotCount(generics.GenericAPIView):
    serializer_class = SonyFilterSerializer
    def get_queryset(self, sonyfilter, *args, **kwargs):
        username = sonyfilter['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner(self.request, username)
        # apply_sonyfilter
        queryset = apply_sonyfilter(sonyfilter, video_only=True)
        return queryset

    def post(self, request, *args, **kwargs):
        filter_serializer = SonyFilterSerializer(data=request.data)
        if filter_serializer.is_valid():
            queryset = self.get_queryset(filter_serializer.validated_data, *args, **kwargs)
            shot_count = queryset.count()
            return Response({"shot_count":shot_count}, status=status.HTTP_200_OK)
        else:
            return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VideoCollectionView(mixins.ListModelMixin,
                  generics.GenericAPIView):
    serializer_class = VideoCollectionSerializer
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner_or_friend(self.request, username)
        self._check_failed_vcollection(requested_user)
        self.queryset = VideoCollection.objects.filter(user=requested_user)
        return self.queryset.order_by("-timestamp")

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def _check_failed_vcollection(self,user):
        video_collections = VideoCollection.objects.filter(user=user)
        if len(video_collections) == 0:
            return
        for video in video_collections:
            if video.status == 'P':
                try:
                    status = TaskResult.objects.get(task_id=video.task_id).status
                    if status == 'FAILURE':
                        video.status = 'F'
                        video.save()
                except Exception:
                    pass

class VideoProcessRetry(generics.GenericAPIView):

    def post(self, request, *args, **kwargs):
        serializer = VideoRetrySerializer(data=request.data)
        if serializer.is_valid():
            if serializer.data['model'] == "VideoSource":
                video = get_object_or_404(VideoSource, user=request.user, pk=serializer.data['pk'])
                if video.status == 'F':
                    from video.video_routines import process_video_source
                    process_video_source(request.user, video)
            elif serializer.data['model'] == "VideoCollection":
                video = get_object_or_404(VideoCollection, user=request.user, pk=serializer.data['pk'])
                if video.status == 'F':
                    from video.video_routines import process_video_collection
                    process_video_collection(request.user, video)
            return Response(status=status.HTTP_202_ACCEPTED)

class VideoSourceUpload(generics.GenericAPIView):
    serializer_class = VideoUploadSerializer
    queryset = []#UserProfile.objects.all()

    def post(self, request, *args, **kwargs):
        serializer = VideoUploadSerializer(data=request.data)
        videosource = get_object_or_404(VideoSource, user=request.user, pk=kwargs['pk'])
        if serializer.is_valid():
            if 'videofile' in serializer.data:
                _handle_videosource_upload(request.FILES['videofile'], request.user, videosource)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class VideoSourceView(mixins.ListModelMixin,
                  generics.GenericAPIView):
    serializer_class = SessionSerializerPlusPlus
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner_or_friend(self.request, username)
        self._check_failed_vsource(requested_user)
        self.queryset = Session.objects.filter(user=requested_user)
        return self.queryset.order_by("-timestamp")

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def _check_failed_vsource(self,user):
        video_sources = VideoSource.objects.filter(user=user)
        if len(video_sources) == 0:
            return
        for video in video_sources:
            if video.status == 'P':
                try:
                    status = TaskResult.objects.get(task_id=video.task_id).status
                    if status == 'FAILURE':
                        video.status = 'F'
                        video.save()
                except Exception:
                    pass

class ProgressView(generics.GenericAPIView):
    serializer_class = SonyProgressSerializer
    queryset = []

    def get(self, request, *args, **kwargs):
        progress_dict = {}
        requested_user = get_object_or_404(User, username=kwargs['username'])
        permission = is_owner_or_friend(request, kwargs['username'])
        period_model = str_to_periodmodel(kwargs['period'])
        periods = period_model.objects.filter(user=requested_user)
        imperial_units = request.user.userprofile.units == 'M'
        for stat in ['swing_speed', 'ball_speed', 'ball_spin']:
            progress_dict[stat] = (str.encode('data:image/svg+xml;base64,')+box_plot(periods, stat, kwargs['swing'], imperial_units)).decode("utf-8")
        serializer = SonyProgressSerializer(progress_dict)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UploadCsv(generics.GenericAPIView):
    serializer_class = CsvSerializer
    queryset = []#UserProfile.objects.all()

    def post(self,request):
        serializer = CsvSerializer(data=request.data)
        if serializer.is_valid():
            if 'sonycsv' in serializer.data:
                _handle_csvfile_upload(request.FILES['sonycsv'], request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)


class UploadAvatar(generics.GenericAPIView):
    serializer_class = AvatarSerializer
    queryset = UserProfile.objects.all()

    def post(self,request):
        serializer = AvatarSerializer(data=request.data)
        if serializer.is_valid():
            profile = request.user.userprofile
            if 'avatar' in serializer.data:
                curr_avatar = profile.avatar
                if curr_avatar.name != 'no-avatar.svg':
                    profile.avatar.delete()
                _handle_avatar_upload(request.FILES['avatar'], profile)
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
                from_user.last_change = timezone.now()
                to_user.last_change = timezone.now()
                from_user.save()
                to_user.save()
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
                _create_default_labels(request.user)
                _create_customer_profile(request.user)
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
            profile = request.user.userprofile
            profile.last_change = timezone.now()
            profile.save()
            serializer.validated_data['success'] = True
            return Response(serializer.data, status=200)
        else:
            return Response(serializer.errors, status=400)

class ShotsFilter(generics.GenericAPIView):
    serializer_class = SonyFilterSerializer
    def get_queryset(self, filter_serializer, *args, **kwargs):
        username = filter_serializer.validated_data['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner_or_friend(self.request, username)
        queryset = apply_sonyfilter(filter_serializer.validated_data)
        return queryset

    def post(self, request, *args, **kwargs):
        filter_serializer = SonyFilterSerializer(data=request.data)
        if filter_serializer.is_valid():
            queryset = self.get_queryset(filter_serializer, *args, **kwargs)
            imperial_units = filter_serializer.validated_data['imperial_units']
            username = filter_serializer.validated_data['username']
            requested_user = get_object_or_404(User, username=username)
            leftie = (requested_user.userprofile.arm == 'L')
            detail_obj = SonyShotSetDetail(queryset, imperial_units=imperial_units, leftie=leftie)
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
        permission = is_owner_or_friend(self.request, self.kwargs['username'])
        queryset = SessionLabel.objects.filter(user__username=self.kwargs['username'])
        return queryset.order_by("category")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        profile = self.request.user.userprofile
        profile.last_change = timezone.now()
        profile.save()

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class LabelDetail(APIView):
    """
    Retrieve, update or delete a snippet instance.
    """
    def get_object(self, pk):
        try:
            return SessionLabel.objects.get(pk=pk, user=self.request.user)
        except SessionLabel.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        label = self.get_object(pk)
        serializer = LabelSerializer(label)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        label = self.get_object(pk)
        serializer = LabelSerializer(label, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        label = self.get_object(pk)
        label.delete()
        profile = request.user.userprofile
        profile.last_change = timezone.now()
        profile.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PeriodDetail(APIView):
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner_or_friend(self.request, username)
        model_class = _str_to_periodmodel(self.kwargs['period'])
        period_obj = _url_to_object(requested_user, **self.kwargs)
        queryset = period_obj.shots.all()
        return queryset

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset(*args, **kwargs)
        detail_obj = SonyShotSetDetail(queryset)
        serializer = ShotSetSerializer(detail_obj)
        return Response(serializer.data)

class LatestActivity(mixins.ListModelMixin,
                  generics.GenericAPIView):
    serializer_class = SessionSerializerPlus
    def get_queryset(self, *args, **kwargs):
        user = self.request.user
        queryset = Session.objects.all()

        QS = Q(user=user)
        QS.add(Q(user__in=user.userprofile.friends.values_list('user', flat=True)), Q.OR)
        queryset = queryset.filter(QS)
        return queryset.order_by("-timestamp")[:10]

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

class YearList(mixins.ListModelMixin,
                  generics.GenericAPIView):
    serializer_class = YearSerializer
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner_or_friend(self.request, username)
        self.queryset = Year.objects.filter(user=requested_user)
        return self.queryset.order_by("-timestamp")

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

class MonthList(mixins.ListModelMixin,
                  generics.GenericAPIView):
    serializer_class = MonthSerializer
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner_or_friend(self.request, username)
        self.queryset = Month.objects.filter(user=requested_user)
        return self.queryset.order_by("-timestamp")

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

class WeekList(mixins.ListModelMixin,
                  generics.GenericAPIView):
    serializer_class = WeekSerializer
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner_or_friend(self.request, username)
        self.queryset = Week.objects.filter(user=requested_user)
        return self.queryset.order_by("-timestamp")

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

class DayList(mixins.ListModelMixin,
                  generics.GenericAPIView):
    serializer_class = DaySerializer
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner_or_friend(self.request, username)
        self.queryset = Day.objects.filter(user=requested_user)
        return self.queryset.order_by("-timestamp")

class SessionList(mixins.ListModelMixin,
                  generics.GenericAPIView):
    serializer_class = SessionSerializer
    def get_queryset(self, *args, **kwargs):
        username = self.kwargs['username']
        requested_user = get_object_or_404(User, username=username)
        permission = is_owner_or_friend(self.request, username)
        self.queryset = Session.objects.filter(user=requested_user)
        return self.queryset.order_by("-timestamp")

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

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
    from tennishots.settings import MEDIA_ROOT
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
    import_result = sony_csv_to_db.apply_async((destination_file, user.pk), queue='db')


def _handle_videosource_upload(f, user, videosource):
    import os
    from tennishots.settings import MEDIA_ROOT
    filename = f.name
    if filename == videosource.filename:
        destination_dir = os.path.join(MEDIA_ROOT,'user_'+str(user.pk),'video_sources','original')
        destination_file = os.path.join(destination_dir,filename)
        if not os.path.exists(destination_dir):
            os.makedirs(destination_dir)

        with open(destination_file, 'wb+') as destination:
            for chunk in f.chunks():
                destination.write(chunk)

        from moviepy.editor import VideoFileClip
        from video.video_routines import match_shots_to_source, process_video_source
        v_file = destination_file
        vclip = VideoFileClip(v_file)
        videosource.original_file = destination_file
        videosource.duration = dt.timedelta(seconds=int(vclip.duration))
        videosource.width = vclip.size[0]
        videosource.height = vclip.size[1]
        videosource.status = 'P'
        videosource.save()
        vclip.reader.close()

        del vclip
        nshots = match_shots_to_source(user, videosource)
        if nshots > 0:
            process_video_source(user, videosource)

        #shots_results = csv_to_shots_db.apply_async((destination_file,user.pk), queue='db')
        #videos_results = csv_to_videos_db.apply_async((destination_file,user.pk), queue='db')
        #import_result = sony_csv_to_db(destination_file, user.pk)

def _handle_videocollection_create(user, shots, title, description):
    timestamp = dt.datetime.now()
    videocollection = VideoCollection()
    videocollection.timestamp = timestamp
    videocollection.title = title
    videocollection.description = description
    videocollection.user = user
    videocollection.save()

    for shot in shots:
        # Take advantage of the fact that Shot and VideoShot have the same pk (OneToOne field)
        videoshot = VideoShot.objects.get(pk=shot.pk, user=user)
        videocollection.videoshots.add(videoshot)
    #videoclip.save()
    from video.video_routines import process_video_collection
    process_video_collection(user, videocollection)

    return videocollection

def __create_default_labels(user):
    category_choices = ((0,'Surface'),
                        (1, 'Opponent'),
                        (2, 'Game type'),
                        (3, 'Competition'),
                        (4, 'Condition'),
                        (5, 'Other'))
    default_labels = []
    default_labels.append(SessionLabel(user=user, category=0, name='Clay'))
    default_labels.append(SessionLabel(user=user, category=0, name='Hard'))
    default_labels.append(SessionLabel(user=user, category=0, name='Grass'))
    default_labels.append(SessionLabel(user=user, category=2, name='Singles'))
    default_labels.append(SessionLabel(user=user, category=2, name='Doubles'))
    default_labels.append(SessionLabel(user=user, category=3, name='Practice'))
    default_labels.append(SessionLabel(user=user, category=3, name='Match'))
    default_labels.append(SessionLabel(user=user, category=4, name='Indoor'))
    default_labels.append(SessionLabel(user=user, category=4, name='Outdooor'))
    default_labels.append(SessionLabel(user=user, category=4, name='Windy'))
    SessionLabel.objects.bulk_create(default_labels)
    return

def _create_default_labels(user):
    label = SessionLabel(user=user, category=0, name='Clay')
    label.save()
    label = SessionLabel(user=user, category=0, name='Hard')
    label.save()
    label = SessionLabel(user=user, category=0, name='Grass')
    label.save()
    label = SessionLabel(user=user, category=2, name='Singles')
    label.save()
    label = SessionLabel(user=user, category=2, name='Doubles')
    label.save()
    label = SessionLabel(user=user, category=3, name='Practice')
    label.save()
    label = SessionLabel(user=user, category=3, name='Match')
    label.save()
    label = SessionLabel(user=user, category=4, name='Indoor')
    label.save()
    label = SessionLabel(user=user, category=4, name='Outdooor')
    label.save()
    label = SessionLabel(user=user, category=4, name='Windy')
    label.save()
    return

def _create_customer_profile(user):
    customer_profile = CustomerProfile(user=user,
                                       outstanding_shots=0,
                                       outstanding_videoshots=0,
                                       shot_rate=0.001,
                                       videoshot_rate=0.002,
                                       amount_due=0.)
    customer_profile.save()
    rate_change = RateChange(user=user,
                             shot_rate=0.001,
                             videoshot_rate=0.002)
    rate_change.save()

def _handle_avatar_upload(f, userprofile):
    import os
    from PIL import Image, ImageOps
    from tennishots.settings import MEDIA_ROOT
    filename = f.name
    print(filename)
    #destination_name = 'user_'+str(userprofile.user.pk)+'/avatar/avatar.png'
    destination_dir = os.path.join(MEDIA_ROOT,'user_'+str(userprofile.user.pk),'avatar')
    #destination_file = os.path.join(destination_dir,filename)
    destination_file = os.path.join(destination_dir,os.path.splitext(filename)[0]+".png")

    if not os.path.exists(destination_dir):
        os.makedirs(destination_dir)

    # resize the avatar to make it small and square.
    image_obj = Image.open(f)
    # ImageOps compatible mode
    if image_obj.mode not in ("L", "RGB", "RGBA"):
        image_obj = image_obj.convert("RGBA")
    imagefit = ImageOps.fit(image_obj, (300, 300), Image.ANTIALIAS)
    imagefit.save(destination_file, 'PNG')

    userprofile.avatar.name = 'user_{0}/avatar/{1}'.format(userprofile.user.pk, os.path.splitext(filename)[0]+".png")
    #userprofile.avatar.name = destination_file
    userprofile.last_change = timezone.now()
    userprofile.save()
