from django.conf.urls import url
from django.views.decorators.csrf import csrf_exempt

from rest_framework.urlpatterns import format_suffix_patterns
from api import views

period_regex = '^(?P<username>.+)/(?P<period>day|month|year|week)/(?P<year>[0-9]{4})(?:/(?P<month>[0-9]{1,2}))?(?:/(?P<day>[0-9]{1,2}))?/?$'

urlpatterns = [
    url(r'^(?P<username>.+)/labels/$', views.LabelList.as_view()),
    url(r'^(?P<username>.+)/session/$', views.SessionList.as_view()),
    url(r'^(?P<username>.+)/session_video/$', views.VideoSourceView.as_view()),
    url(r'^(?P<username>.+)/videocollections/$', views.VideoCollectionView.as_view()),
    url(r'^(?P<username>.+)/day/$', views.DayList.as_view()),
    url(r'^(?P<username>.+)/week/$', views.WeekList.as_view()),
    url(r'^(?P<username>.+)/month/$', views.MonthList.as_view()),
    url(r'^(?P<username>.+)/year/$', views.YearList.as_view()),
    url(r'^(?P<username>.+)/(?P<period>session|day|month|year|week)/(?P<year>[0-9]{4})(?:/(?P<month>[0-9]{1,2}))?(?:/(?P<day>[0-9]{1,2}))?(?:/(?P<hour>[0-9]{1,2}))?/?$', views.PeriodDetail.as_view()),
    url(r'^(?P<username>.+)/progress/(?P<period>session|day|month|year|week)/(?P<swing>[A-Z]{2})/?$', views.ProgressView.as_view()),
    url(r'^addsessionlabel/$', views.AddSessionLabel.as_view()),
    url(r'^shotsfilter/$', views.ShotsFilter.as_view()),
    url(r'^test/$', views.TestView.as_view()),
    url(r'^label/(?P<pk>[0-9]+)/$', views.LabelDetail.as_view()),
    url(r'^sourceupload/(?P<pk>[0-9]+)/$', views.VideoSourceUpload.as_view()),
    url(r'^avatarupload/$', views.UploadAvatar.as_view()),
    url(r'^csvupload/$', views.UploadCsv.as_view()),
    url(r'^csrf/$', views.CsrfView),
    url(r'^shots/$', views.PeriodStrokeDetail.as_view()),
    url(r'^profile/$', views.UserProfileView.as_view()),
    url(r'^(?P<username>.+)/player/$', views.PlayerProfileView.as_view()),
    url(r'^(?P<username>.+)/summary/$', views.SummaryView.as_view()),
    url(r'^(?P<username>.+)/customer/$', views.CustomerProfileView.as_view()),
    url(r'^(?P<username>.+)/order/$', views.MakeOrderView.as_view()),
    url(r'^friends/$', views.GetFriends.as_view()),
    url(r'^addfriend/$', views.AddFriend.as_view()),
    url(r'^friendrequests/$', views.PendingFriendRequests.as_view()),
    url(r'^searchuser/$', views.SearchUser.as_view()),
    url(r'^latestactivity/$', views.LatestActivity.as_view()),
    url(r'^processvideo/$', views.VideoProcessRetry.as_view()),
    url(r'^shotcount/$', views.ShotCount.as_view()),
    url(r'^createvideocollection/$', views.CreateVideoCollection.as_view()),
    url(r'^lastchanges/$', views.LastChanges.as_view()),
    #url(r'^snippets/(?P<pk>[0-9]+)/$', views.SnippetDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
