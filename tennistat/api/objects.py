import datetime as dt
import numpy as np
from collections import OrderedDict
from api.impact_heatmap import make_heatmap
from shot.models import Session, Day, Week, Month, Year, Shot

mi2km = 1.609344

class SonyFilter(object):

    def __init__(self, input_dict):
        if not isinstance(input_dict, dict):
            raise Exception
        self.filter = {}
        if 'username' in input_dict and 'sensor' in input_dict:
            self.filter['username'] = input_dict['username']
            self.filter['sensor'] = input_dict['sensor']
        else:
            raise Exception

        if 'filters' not in input_dict:
            return

        self.filter['filters'] = {}
        filter_has_periods = 'periods' in input_dict['filters']
        for filter_name, filter_data in input_dict['filters'].items():
            if filter_name not in ['periods','date_range','swing_speed','ball_speed','ball_spin','swing_type']:
                continue

            if filter_name in ['swing_speed','ball_speed','ball_spin']:
                if 'min' not in filter_data and 'max' not in filter_data:
                    continue
                self.filter['filters'][filter_name]={}
                if 'min' in filter_data: self.filter['filters'][filter_name]['min'] = filter_data['min']
                if 'max' in filter_data: self.filter['filters'][filter_name]['max'] = filter_data['max']
            elif filter_name == 'periods':
                if 'name' in filter_data:
                    if filter_data['name'] in ['year','month','week','day','session']:
                        if 'pks' in filter_data and len(filter_data['pks']) > 0:
                            self.filter['filters']['periods']={}
                            self.filter['filters']['periods']['name'] = filter_data['name']
                            self.filter['filters']['periods']['pks'] = filter_data['pks']
            elif filter_name == 'date_range':
                if filter_has_periods:
                    continue
                elif 'min' not in filter_data and 'max' not in filter_data:
                    continue
                self.filter['filters']['date_range']={}
                if 'min' in filter_data: self.filter['filters'][filter_name]['min'] = filter_data['min']
                if 'max' in filter_data: self.filter['filters'][filter_name]['max'] = filter_data['max']
            elif filter_name == 'swing_type':
                if len(filter_data) > 0:
                    swings = []
                    for swing in filter_data:
                        if swing in ['FH','FS','FV','BH','BS','BV','SM','SE']:
                            swings.append(swing)
                    if len(swings) > 0:
                        self.filter['filters']['swing_type'] = swings

        return

    def apply(self, input_queryset=None):
        from django.db.models import Q
        QS = Q(user__username=self.filter['username'])
        filters = self.filter['filters']
        if 'periods' in filters:
            period_name = filters['periods']['name']
            period_model = _str_to_periodmodel(period_name)
            pks = filters['periods']['pks']
            the_periods = period_model.objects.filter(user__username=self.filter['username'],pk__in=pks)
            if period_name == 'session' : QS.add(Q(session__in=the_periods), Q.AND)
            if period_name == 'day' : QS.add(Q(day__in=the_periods), Q.AND)
            if period_name == 'week' : QS.add(Q(week__in=the_periods), Q.AND)
            if period_name == 'month' : QS.add(Q(month__in=the_periods), Q.AND)
            if period_name == 'year' : QS.add(Q(year__in=the_periods), Q.AND)
        if 'date_range' in filters:
            if 'min' in filters['date_range']:
                start = dt.datetime.strptime(filters['date_range']['min'],'%Y-%m-%d')
                QS.add(Q(timestamp__gt=start), Q.AND)
            if 'max' in filters['date_range']:
                end = dt.datetime.strptime(filters['date_range']['max']+'T23:59:59','%Y-%m-%dT%H:%M:%S')
                QS.add(Q(timestamp__lt=end), Q.AND)

        queryset = Shot.objects.filter(QS)
        return queryset







class SonyShotSetDetail(object):

    def __init__(self, queryset,
                 strokes=['FH','FS','FV','BH','BS','BV','SE','SM'],
                 stats=['swing_speed','ball_speed','ball_spin'],
                 imperial_units=False, impact_map=True, leftie=False):
        self.sensor = 'SO'
        self.count = len(queryset)
        self.imperial_units = imperial_units
        self.strokes = []
        for stroke in strokes:
            strokedict = OrderedDict()
            strokedict['name'] = stroke
            if stroke == 'AA':
                stroke_shots = queryset
            else:
                stroke_shots = queryset.filter(data__swing_type=stroke)
            strokedict['count'] = len(stroke_shots)
            if len(stroke_shots) > 0:
                strokedict['stats'] = []
                if impact_map:
                    statdict = OrderedDict()
                    statdict['name'] = 'impact_heatmap'
                    if ((leftie and not stroke in ['BH','BS','BV']) or
                        (stroke in ['BH','BS','BV'] and not leftie)):
                        rotation = 270
                    else:
                        rotation = 90
                    vals = stroke_shots.values_list('data__impact_position')
                    vals = np.asarray(vals, dtype=int).flatten()
                    occurrences = np.bincount(vals, minlength=26)
                    #statdict['occurrences'] = occurrences
                    #statdict['heatmap'] = str.encode('data:image/png;base64,')+make_heatmap(occurrences,rotation)
                    statdict['heatmap'] = make_heatmap(occurrences,rotation)
                    strokedict['stats'].append(statdict)

                for stat in stats:
                    statdict = OrderedDict()
                    statdict['name'] = stat
                    vals = stroke_shots.values_list('data__'+stat)
                    vals = np.asarray(vals).flatten()
                    if stat == 'ball_spin':
                        bins=21
                        rang = (-10,11)
                    else:
                        bins=40
                        if imperial_units:
                            vals = vals/mi2km
                            rang = (20,100)
                        else:
                            rang = (30,160)
                    y, x = np.histogram(vals, bins=bins, range=rang)
                    statdict['x'] = x[:-1]
                    statdict['y'] = y
                    strokedict['stats'].append(statdict)

            self.strokes.append(strokedict)
        return

def _str_to_periodmodel(string):
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

"""
Scheleton of a JSON filter for the sony sensor
{
"username":"ales",
"sensor":"SO",
"filters":{
	"periods":{
		"name":"day",
		"pks":[30,33,35]
		},
	"date_range":{
		"start":"yyyy-mm-dd",
		"end":"yyyy-mm-dd"
		},
	"swing_speed":{
		"min":0,
		"max":1000
		},
	"ball_speed":{
		"min":0,
		"max":1000
		},
	"ball_spin":{
		"min":-10,
		"max":10
		},
	"swing_type":[]
	}
}
"""
