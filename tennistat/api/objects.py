import numpy as np
from collections import OrderedDict
from api.impact_heatmap import make_heatmap

mi2km = 1.609344

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
