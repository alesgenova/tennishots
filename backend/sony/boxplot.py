from sony.constants import SWING_COLORS
from colour import Color
import numpy as np
import io
import matplotlib
import matplotlib.pyplot as plt
import base64

def box_plot( periods, stat, swing, imperial_units ):
    mi2km = 1.609344
    box_per_axis = 14
    max_boxes = box_per_axis * 2
    box_fill = SWING_COLORS[swing]
    color = Color(box_fill)
    color.set_luminance(max(0.,color.get_luminance()-0.2))
    box_border = color.get_web()
    color = Color(box_fill)
    color.set_luminance(max(0.,color.get_luminance()-0.3))
    box_median = color.get_web()

    data = []
    data_labels = []
    upperLabels = []
    ngroups = periods.count()
    if ngroups > max_boxes:
        all_periods = periods.all()[ngroups-max_boxes:]
    else:
        all_periods = periods.all()
    for period in all_periods:
        vals = period.shots.filter(data__swing_type=swing).values_list('data__'+stat)
        #vals = np.zeros(50)
        vals = np.array(vals).flatten()
        if stat in ['swing_speed', 'ball_speed'] and imperial_units:
            vals /= mi2km
        data_labels.append(str(period))
        data.append(np.abs(vals))
        upperLabels.append('({})'.format(len(vals)))

    naxes = ngroups//box_per_axis + (ngroups%box_per_axis > 0)
    fig, axes = plt.subplots(nrows=naxes, ncols=1, squeeze=False,figsize=(6,4*naxes))
    #fig.subplots_adjust(hspace=0.4)
    y_min = 20
    y_max = 160
    if imperial_units:
        y_min = 10
        y_max = 100
    if swing == 'SE':
        if imperial_units:
            y_min = 50
            y_max = 140
        else:
            y_min = 80
            y_max = 220
    if stat == 'swing_speed':
        if imperial_units:
            y_label = 'Swing Speed (mi/h)'
        else:
            y_label = 'Swing Speed (km/h)'
    elif stat == 'ball_speed':
        if imperial_units:
            y_label = 'Ball Speed (mi/h)'
        else:
            y_label = 'Ball Speed (km/h)'
    elif stat == 'ball_spin':
        y_label = 'Ball Spin (abs)'
        y_min = 0
        y_max = 10
    y_lim = (y_min,y_max)
    y_pos = y_min+0.05*(y_max-y_min)

    for iax, ax in enumerate(axes.flatten()):
        igroup = iax*box_per_axis
        if iax==0:
            pass
            #ax.set_title(title_)
        bp = ax.boxplot(data[igroup:min(ngroups,igroup+box_per_axis)],
                   labels=data_labels[igroup:min(ngroups,igroup+box_per_axis)],
                   patch_artist=True)
        ax.set_ylim(y_lim)
        ax.set_ylabel(y_label)
        ax.yaxis.grid(True, linestyle='-', which='major', color='lightgrey',
           alpha=0.75)
        plt.setp(ax.get_xticklabels(), rotation=30, fontsize=9, ha='right')
        if naxes > 1:
            ax.set_xlim(0.5,box_per_axis+0.5)

        pos = np.arange(box_per_axis) + 1
        weights = 'semibold'
        for tick, label in enumerate(ax.get_xticklabels()):
            k = tick % 2
            ax.text(pos[tick], y_pos, upperLabels[tick],
                     horizontalalignment='center', size='x-small')#, weight=weights)

        for box in bp['boxes']:
            box.set(color=box_border, linewidth=1.5)
            box.set(facecolor=box_fill)
        for whisker in bp['whiskers']:
            whisker.set(color=box_border, linewidth=1.5)
        for cap in bp['caps']:
            cap.set(color=box_border, linewidth=1.5)
        for median in bp['medians']:
            median.set(color=box_median, linewidth=1.5)
        for flier in bp['fliers']:
            flier.set(marker='o', alpha=0.25)
            flier.set_markersize(5)
            flier.set_markeredgecolor(box_fill)
            flier.set_markerfacecolor(box_fill)


    fig.tight_layout()
    tmp=io.BytesIO()
    fig.savefig(tmp,format='svg')
    #return base64.b64encode(tmp.getvalue()).decode("utf-8")
    #return tmp.getvalue().decode("utf-8")
    return base64.b64encode(tmp.getvalue())
