import datetime as dt
from django.shortcuts import get_object_or_404
from shot.models import Session, Day, Week, Month, Year

def str_to_periodmodel(string):
    if string == 'session':
        return Session
    elif string == 'day':
        return Day
    elif string == 'week':
        return Week
    elif string == 'month':
        return Month
    elif string == 'year':
        return Year

def url_to_object(user, period='', year=None, month=None, day=None, hour=None, *args, **kwargs):
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
