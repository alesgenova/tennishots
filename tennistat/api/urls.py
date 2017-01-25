from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from api import views

period_regex = '^(?P<username>.+)/(?P<period>day|month|year|week)/(?P<year>[0-9]{4})(?:/(?P<month>[0-9]{1,2}))?(?:/(?P<day>[0-9]{1,2}))?/?$'

urlpatterns = [
    url(r'^(?P<username>.+)/labels/$', views.LabelList.as_view()),
    url(r'^(?P<username>.+)/days/$', views.DayList.as_view()),
    url(r'^(?P<username>.+)/weeks/$', views.WeekList.as_view()),
    url(r'^(?P<username>.+)/months/$', views.MonthList.as_view()),
    url(r'^(?P<username>.+)/years/$', views.YearList.as_view()),
    url(r'^(?P<username>.+)/(?P<period>session|day|month|year|week)/(?P<year>[0-9]{4})(?:/(?P<month>[0-9]{1,2}))?(?:/(?P<day>[0-9]{1,2}))?(?:/(?P<hour>[0-9]{1,2}))?/?$', views.PeriodDetail.as_view()),
    url(r'^(?P<username>.+)/filter/$', views.ShotsFromPeriods.as_view()),
    url(r'^test/$', views.TestView),
    url(r'^shots/$', views.PeriodStrokeDetail.as_view()),
    #url(r'^snippets/(?P<pk>[0-9]+)/$', views.SnippetDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
