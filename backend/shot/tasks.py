# Create your tasks here
from __future__ import absolute_import, unicode_literals
from celery import shared_task
from shot.models import Year, Month, Week, Day, Session, Shot, SonyData
from shot.import_sony import csv2shotsvideos
from video.models import VideoSource
import datetime as dt
import pandas as pd
from django.contrib.auth.models import User
from customers.models import CustomerProfile, Transaction

@shared_task
def sony_csv_to_db(csvfile, user_id):
    user = User.objects.get(pk=user_id)
    shots_videos = csv2shotsvideos(csvfile=csvfile)
    prev_date = dt.date(1980,1,1)
    prev_timestamp = dt.datetime(1980,1,1,0,0,0)
    new_shots = []
    new_shotdata = []
    new_videos = []
    for index, entry in shots_videos.iterrows():
        y = entry.timestamp.to_period('A').start_time.date()
        m = entry.timestamp.to_period('m').start_time.date()
        w = entry.timestamp.to_period('w').start_time.date()
        d = entry.timestamp.to_period('d').start_time.date()
        h = entry.timestamp.to_period('H').start_time
        t = entry.timestamp
        curr_date = d

        if curr_date != prev_date:
            yy = Year.objects.get_or_create(timestamp=y, user=user)[0]
            mm = Month.objects.get_or_create(timestamp=m, yy=yy, user=user)[0]
            ww = Week.objects.get_or_create(timestamp=w, user=user)[0]
            dd = Day.objects.get_or_create(timestamp=d, mm=mm, ww=ww, user=user)[0]
            ss = Session.objects.get_or_create(timestamp=h, dd=dd, user=user)[0]
        else:
            # we might have more than one session per day.
            delta_t = (t - prev_timestamp).total_seconds()
            if delta_t > 7200:
                ss = Session.objects.get_or_create(timestamp=h, day=dd, user=user)

        prev_date = curr_date
        prev_timestamp = t

        is_video = pd.notnull(entry.video_filename)
        is_shot = pd.notnull(entry.swing_type)

        if is_shot:
            try:
                user.shots.get(timestamp=t, user=user)
            except Shot.DoesNotExist:
                new_shotdata.append({'swing_type':_shorten_swing_type(entry.swing_type),
                                     'swing_speed':entry.swing_speed,
                                     'ball_speed':entry.ball_speed,
                                     'ball_spin':entry.ball_spin,
                                     'impact_position':entry.impact_position,
                                     })
                new_shots.append(Shot(timestamp=t,
                                      session=ss,
                                      day=dd,
                                      week=ww,
                                      month=mm,
                                      year=yy,
                                      user=user,
                                      sensor='SO'))
        elif is_video:
            try :
                user.videos.get(timestamp=t, user=user)
            except VideoSource.DoesNotExist:
                new_videos.append(VideoSource(timestamp=t,
                          #duration=dt.timedelta(seconds=0),
                          filename=entry.video_filename,
                          session=ss,
                          day=dd,
                          week=ww,
                          month=mm,
                          year=yy,
                          user=user))

    Shot.objects.bulk_create(new_shots)
    # now we need to also create the shot data in the db
    new_sonydata = []
    for shot_, data in zip(new_shots, new_shotdata):
        shot = Shot.objects.get(timestamp=shot_.timestamp, user=user)
        new_sonydata.append(SonyData(shot=shot,
                                     swing_type=data['swing_type'],
                                     swing_speed=data['swing_speed'],
                                     ball_speed=data['ball_speed'],
                                     ball_spin=data['ball_spin'],
                                     impact_position=data['impact_position'],
                                    )
                            )
    SonyData.objects.bulk_create(new_sonydata)
    VideoSource.objects.bulk_create(new_videos)

    new_shots_billed = len(new_shots)
    customer = CustomerProfile.objects.get(user=user)
    dollar_amount = new_shots_billed*customer.shot_rate
    customer.outstanding_shots += new_shots_billed
    customer.amount_due += dollar_amount
    customer.save()
    transaction = Transaction()
    transaction.user = user
    transaction.shot_count = new_shots_billed
    transaction.videoshot_count = 0
    transaction.dollar_amount = dollar_amount
    transaction.save()

    return

def _shorten_swing_type(swing_type):
    swing2short = {
                  'FOREHAND_SPIN_FLAT':'FH',
                  'BACKHAND_SPIN_FLAT':'BH',
                  'FOREHAND_SLICE':'FS',
                  'BACKHAND_SLICE':'BS',
    	          'FOREHAND_VOLLEY':'FV',
                  'BACKHAND_VOLLEY':'BV',
                  'SMASH':'SM',
                  'SERVE':'SE',
                   }
    return swing2short[swing_type]
