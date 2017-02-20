# Create your tasks here
from __future__ import absolute_import, unicode_literals
#from celery import shared_task
from shot.models import Year, Month, Week, Day, Session, Shot
import datetime as dt
from video.models import VideoSource, VideoShot
from video.models import VideoClip as VideoClipModel
from video.load_csv import csv2videos
import pandas as pd
from django.contrib.auth.models import User
import os

# moviepy blob stuff
from video.moviepy_blob import make_shots_video_multi_bare


# @shared_task
def make_shots_video_multi(shots_pk, fileout, stitching='lax', sizeout=(1920,1080), leftie=False, imperial=False, model='videosource', model_pk=-1):

    shots = []
    for pk_ in shots_pk:
        shots.append(VideoShot.objects.get(pk=int(pk_)))

    make_shots_video_multi_bare(shots, fileout=fileout, stitching=stitching, sizeout=sizeout, leftie=leftie, imperial=imperial)

    if model == 'videosource':
        obj = VideoSource.objects.get(pk=model_pk)
        obj.processed_file.name = 'user_{0}/video_sources/processed/{1}'.format(shots[0].user.id, os.path.split(fileout)[1])
        obj.thumbnail.name = 'user_{0}/video_sources/processed/{1}'.format(shots[0].user.id, os.path.split(fileout)[1]+".png")
        obj.status = 'P'
        obj.save()
    elif model == 'videoclip':
        obj = VideoClipModel.objects.get(pk=model_pk)
        obj.processed_file.name = 'user_{0}/video_clips/{1}'.format(shots[0].user.id, os.path.split(fileout)[1])
        obj.thumbnail.name = 'user_{0}/video_clips/{1}'.format(shots[0].user.id, os.path.split(fileout)[1]+".png")
        obj.save()

    return
