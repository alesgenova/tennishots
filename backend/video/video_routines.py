from shot.models import Shot
from video.models import VideoShot
import numpy as np
import os
from tennistat.settings import MEDIA_ROOT
from video.tasks import make_shots_video_multi
#from payment.models import CustomerProfile

def match_shots_to_source(user, video_source):
    start = video_source.timestamp
    stop = start + video_source.duration
    shots = user.shots.filter(timestamp__range=(start,stop))
    new_shots = []
    for shot in shots:
        new_shots.append(VideoShot(shot=shot, user=user, video=video_source,
                         seconds = (shot.timestamp - start).total_seconds()))
        #video_shot = VideoShot()
        #video_shot.shot = shot
        #video_shot.user = user
        #video_shot.video = video_source
        #video_shot.seconds = (shot.timestamp - start).seconds
        #video_shot.save()

    #new_shots_billed = shots.count()
    VideoShot.objects.bulk_create(new_shots)
    #customer = CustomerProfile.objects.get(user=user)
    #customer.new_videoshots += new_shots_billed
    #customer.amount_due += new_shots_billed*customer.videoshot_rate
    #customer.save()

    return shots.count()

def process_video_source(user, video_source):
    shots_pk = np.array(video_source.videoshots.values_list('pk')).flatten()
    processed_dir = os.path.join(MEDIA_ROOT,'user_{0}/video_sources/processed/'.format(user.id))
    processed_filename = os.path.join(processed_dir, video_source.filename)
    if not os.path.exists(processed_dir):
        os.makedirs(processed_dir)
    shots_pk = list(shots_pk.astype(str))
    leftie = user.userprofile.arm == 'L'
    imperial = user.userprofile.units == 'M'
    #make_shots_video_multi(shots_pk, processed_filename, 'lax',
    #                             (video_source.width,video_source.height), leftie, imperial,
    #                             'videosource', video_source.pk)
    result = make_shots_video_multi.apply_async((shots_pk, processed_filename, 'lax',
                                 (video_source.width,video_source.height), leftie, imperial,
                                 'videosource', video_source.pk),
                                 queue='video')
    video_source.task_id = result.task_id
    video_source.status = 'P'
    video_source.save()
    return

def process_video_collection(user, videocollection):
    #shots_pk = list(shots_pk_.astype(str))
    shots_pk = np.array(videocollection.videoshots.values_list('pk')).flatten()
    timestamp_str = videocollection.timestamp.strftime('%Y%m%d%H%M%S')
    processed_dir = os.path.join(MEDIA_ROOT,'user_{0}/video_collections/'.format(user.id))
    processed_filename = os.path.join(processed_dir, '{0}.mp4'.format(timestamp_str))
    if not os.path.exists(processed_dir):
        os.makedirs(processed_dir)
    shots_pk = list(shots_pk.astype(str))
    leftie = user.userprofile.arm == 'L'
    imperial = user.userprofile.units == 'M'
    result = make_shots_video_multi.apply_async((shots_pk, processed_filename, 'lax',
                                 (1280,720), leftie, imperial,
                                 'videocollection', videocollection.pk),
                                 queue='video')
    videocollection.task_id = result.task_id
    videocollection.status = 'P'
    videocollection.save()
    return
