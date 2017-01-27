import pandas as pd
import datetime as dt

def csv2shotsvideos(csvfile):
    mi2km = 1.609344
    try:
        df = pd.read_csv(csvfile,parse_dates=[0])
    except Exception:
        return None, None
    if all(df.columns == ['timestamp', 'manufacturer_name', 'racket_name', 'swing_type',
               'impact_position', 'ball_speed[km/h]', 'ball_spin', 'swing_speed[km/h]',
               'tag_id', 'video_filename']):
        df.rename_axis({'ball_speed[km/h]':'ball_speed',
                       'swing_speed[km/h]':'swing_speed'},
                       axis='columns',inplace=True)
        #df['swing_speed_mi'] = df['swing_speed']/1.609344
        #df['ball_speed_mi'] = df['ball_speed']/1.609344
    elif all(df.columns == ['timestamp', 'manufacturer_name', 'racket_name', 'swing_type',
               'impact_position', 'ball_speed[mi/h]', 'ball_spin', 'swing_speed[mi/h]',
               'tag_id', 'video_filename']):
        df.rename_axis({'ball_speed[mi/h]':'ball_speed',
                        'swing_speed[mi/h]':'swing_speed'},
                        axis='columns',inplace=True)
        #df['swing_speed_mi'] = df['swing_speed']*1.0
        #df['ball_speed_mi'] = df['ball_speed']*1.0
        df['swing_speed'] = df['swing_speed']*mi2km
        df['ball_speed'] = df['ball_speed']*mi2km
    else:
        return None, None
    #shots = df[df.swing_type.notnull()][['timestamp','swing_type',
    #                                     'swing_speed','ball_speed',
    #                                     #'swing_speed_mi','ball_speed_mi',
    #                                     'ball_spin','impact_position',
    #                                     'video_filename']].reset_index(drop=True)
    #videos = pd.DataFrame(df[df.video_filename.notnull()]
    #                        [['timestamp','video_filename']])
    # don't add to db videos that obviously don't contain any shots.
    shots_videos = df[['timestamp','swing_type',
                      'swing_speed','ball_speed',
                      'ball_spin','impact_position',
                      'video_filename']].copy()
    prev_index = -10
    for index, entry in shots_videos.iterrows():
        if pd.notnull(entry.video_filename):
            if index == prev_index+1:
                shots_videos.drop(prev_index, inplace=True)
            prev_index = index
    #videos = videos.reset_index(drop=True)


    return shots_videos
