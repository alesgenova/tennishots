from collections import OrderedDict
import datetime as dt
import numpy as np
from django.db.models import Q
from generic.routines import str_to_periodmodel
from sony.impact_heatmap import make_heatmap
from shot.models import Session, Day, Week, Month, Year, Shot

def apply_sonyfilter(filter_obj, input_queryset=None):
    """
    Routine to apply a SonyFilter (which is simply a Dict validated from a JSON request through serializers)
    and return a queryset of shots.
    """
    username = filter_obj['username']
    QS = Q(user__username=username)
    filters = filter_obj['filters']
    imperial_units = False
    use_daterange = True
    if 'periods' in filters:
        pks = filters['periods']['pks']
        if len(pks) > 0:
            use_daterange = False
            period_name = filters['periods']['name']
            period_model = str_to_periodmodel(period_name)
            pks = filters['periods']['pks']
            the_periods = period_model.objects.filter(user__username=username,pk__in=pks)
            if period_name == 'session' : QS.add(Q(session__in=the_periods), Q.AND)
            if period_name == 'day' : QS.add(Q(day__in=the_periods), Q.AND)
            if period_name == 'week' : QS.add(Q(week__in=the_periods), Q.AND)
            if period_name == 'month' : QS.add(Q(month__in=the_periods), Q.AND)
            if period_name == 'year' : QS.add(Q(year__in=the_periods), Q.AND)
    if 'date_range' in filters and use_daterange:
        if 'min' in filters['date_range']:
            #start = dt.datetime.strptime(filters['date_range']['min'],'%Y-%m-%d')
            start = dt.datetime(**filters['date_range']['min'])
            QS.add(Q(timestamp__gt=start), Q.AND)
        if 'max' in filters['date_range']:
            #end = dt.datetime.strptime(filters['date_range']['max']+'T23:59:59','%Y-%m-%dT%H:%M:%S')
            end = dt.datetime(**filters['date_range']['max'],hour=23, minute=59, second=59)
            QS.add(Q(timestamp__lt=end), Q.AND)
    if 'swing_speed' in filters:
        minimum = filters['swing_speed'][0]
        maximum = filters['swing_speed'][1]
        QS.add(Q(data__swing_speed__gte=minimum), Q.AND)
        QS.add(Q(data__swing_speed__lte=maximum), Q.AND)
    if 'ball_speed' in filters:
        minimum = filters['ball_speed'][0]
        maximum = filters['ball_speed'][1]
        QS.add(Q(data__ball_speed__gte=minimum), Q.AND)
        QS.add(Q(data__ball_speed__lte=maximum), Q.AND)
    if 'ball_spin' in filters:
        minimum = filters['ball_spin'][0]
        maximum = filters['ball_spin'][1]
        QS.add(Q(data__ball_spin__gte=minimum), Q.AND)
        QS.add(Q(data__ball_spin__lte=maximum), Q.AND)

    queryset = Shot.objects.filter(QS)
    return queryset


class SonyShotSetDetail(object):
    """
    Class that will be serialized to return a summary of a Sony Shot Queryset
    """
    def __init__(self, queryset,
                 strokes=['FH','FS','FV','SE','BH','BS','BV','SM'],
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
            strokedict['stats'] = OrderedDict()
            if len(stroke_shots) > 0:
                if impact_map:
                    #statdict = OrderedDict()
                    #statdict['name'] = 'impact_heatmap'
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
                    #statdict['heatmap'] = make_heatmap(occurrences,rotation)
                    #strokedict['stats']['heatmap'] = make_heatmap(occurrences,rotation)
                    strokedict['stats']['heatmap'] = str.encode('data:image/png;base64,')+make_heatmap(occurrences,rotation)

                for stat in stats:
                    statdict = OrderedDict()
                    #statdict['name'] = stat
                    vals = stroke_shots.values_list('data__'+stat)
                    vals = np.asarray(vals).flatten()
                    labels = []
                    if stat == 'ball_spin':
                        bins=21
                        rang = (-10,11)
                        labels = ['']*bins
                        labels[0], labels[2], labels[4], labels[6], labels[8], labels[10], labels[12], labels[14], labels[16], labels[18], labels[20] = (-10,-8,-6,-4,-2,0,2,4,6,8,10)
                    else:
                        bins=40
                        labels = ['']*bins
                        if imperial_units:
                            vals = vals/mi2km
                            rang = (20,100)
                            labels[5], labels[10], labels[15], labels[20], labels[25], labels[30], labels[35] = (30,40,50,60,70,80,90)
                        else:
                            rang = (30,160)
                            labels[6], labels[12], labels[18], labels[24], labels[30], labels[36] = (50, 70, 90, 110, 130, 150)
                        labels[0], labels[bins-1] = (rang[0],rang[1])
                    y, x = np.histogram(vals, bins=bins, range=rang)
                    statdict['x'] = labels #x[:-1]
                    #statdict['y'] = y/np.max(y)
                    statdict['y'] = y/np.sum(y)
                    #strokedict['stats'].append(statdict)
                    strokedict['stats'][stat] = statdict

            elif len(stroke_shots) == 0:  # include empty so it's easier on the frontend
                for stat in stats:
                    statdict = OrderedDict()
                    labels = []
                    if stat == 'ball_spin':
                        bins=21
                        rang = (-10,11)
                        labels = ['']*bins
                        labels[0], labels[2], labels[4], labels[6], labels[8], labels[10], labels[12], labels[14], labels[16], labels[18], labels[20] = (-10,-8,-6,-4,-2,0,2,4,6,8,10)
                    else:
                        bins=40
                        labels = ['']*bins
                        if imperial_units:
                            rang = (20,100)
                            labels[5], labels[10], labels[15], labels[20], labels[25], labels[30], labels[35] = (30,40,50,60,70,80,90)
                        else:
                            rang = (30,160)
                            labels[6], labels[12], labels[18], labels[24], labels[30], labels[36] = (50, 70, 90, 110, 130, 150)
                        labels[0], labels[bins-1] = (rang[0],rang[1])
                    statdict['x'] = labels #x[:-1]
                    statdict['y'] = []
                    #strokedict['stats'].append(statdict)
                    strokedict['stats'][stat] = statdict


            self.strokes.append(strokedict)
        return

"""
This object is obsolete since I've created a bunch of serializers with the same functionality and are more robust

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
            period_model = str_to_periodmodel(period_name)
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

"""
