from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from api import views

urlpatterns = [
    url(r'^(?P<username>.+)/days/$', views.DayList.as_view()),
    url(r'^(?P<username>.+)/weeks/$', views.WeekList.as_view()),
    url(r'^(?P<username>.+)/months/$', views.MonthList.as_view()),
    url(r'^(?P<username>.+)/years/$', views.YearList.as_view()),
    url(r'^test/$', views.TestView),
    url(r'^shots/$', views.PeriodStrokeDetail.as_view()),
    #url(r'^snippets/(?P<pk>[0-9]+)/$', views.SnippetDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
