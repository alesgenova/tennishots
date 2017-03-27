"""
  a bunch of badly written routines that take a list of VideoShot PKs and
  create a video of the shots with overlays of such data.
  Smart enough to understand if shots are not consecutive and to insert
  transitions accordingly.
  compositing uses moviepy
"""

from moviepy.editor import *
from PIL import Image
#from video.models import VideoShot

def make_shots_video_multi_bare(shots, fileout, stitching='lax', sizeout=(1920,1080), leftie=False, imperial=False):

    clips = []
    curr_clip = ''
    new_clip_offset = 2
    FPS = 29.97
    #FPS = 30
    nshots = len(shots)
    mi2km = 1.609344

    if stitching == 'tight':
        new_clip_offset = 2
        break_clip_if_longer = 10
        fade_duration = 0.5

    elif stitching == 'lax':
        new_clip_offset = 6
        break_clip_if_longer = 13
        fade_duration = 1.

    overlay_anticipation = 0.#-0.5
    overlay_duration_max = 5


    print(nshots)

    shot_overlay_clips = []

    continue_curr_clip = False

    master_duration = 0

    for ishot, shot in enumerate(shots):
        curr_clip = shot.video
        curr_sec_in_video = shot.seconds

        if not continue_curr_clip:

            first_sec_in_video = curr_sec_in_video
            video_start = max(0, first_sec_in_video - new_clip_offset)

        shot_overlay_start = (master_duration
                              + curr_sec_in_video
                              #- first_sec_in_video + new_clip_offset
                              - video_start
                              - overlay_anticipation)

        if ishot < nshots -1:
            next_clip = shots[ishot+1].video
            next_sec_in_video = shots[ishot+1].seconds

            if (curr_clip == next_clip
                and next_sec_in_video - curr_sec_in_video <= break_clip_if_longer
                and next_sec_in_video - curr_sec_in_video > 0):
                shot_overlay_duration = min(overlay_duration_max, next_sec_in_video - curr_sec_in_video)
                continue_curr_clip = True

            else:
                video_stop = min(curr_sec_in_video + new_clip_offset,curr_clip.duration.total_seconds())
                shot_overlay_duration = min(overlay_duration_max, new_clip_offset - overlay_anticipation)
                clips.append(VideoFileClip(curr_clip.original_file.path)
                             .subclip(video_start,video_stop)
                             .set_start(master_duration)
                             .resize(newsize=sizeout)
                             .fadein(fade_duration)
                             .fadeout(fade_duration))
                master_duration += video_stop - video_start
                continue_curr_clip = False

        else:
            shot_overlay_duration = min(overlay_duration_max, new_clip_offset - overlay_anticipation)
            video_stop = min(curr_sec_in_video + new_clip_offset,curr_clip.duration.total_seconds())
            clips.append(VideoFileClip(curr_clip.original_file.path)
                         .subclip(video_start,video_stop)
                         .set_start(master_duration)
                         .resize(newsize=sizeout)
                         .fadein(fade_duration)
                         .fadeout(fade_duration))
            master_duration += video_stop - video_start
            continue_curr_clip = False # not really needed


        swing_type = shot.shot.data.swing_type
        impact_position = int(shot.shot.data.impact_position)
        if imperial:
            swing_speed = round(shot.shot.data.swing_speed/mi2km)
            ball_speed = round(shot.shot.data.ball_speed/mi2km)
        else:
            swing_speed = round(shot.shot.data.swing_speed)
            ball_speed = round(shot.shot.data.ball_speed)
        ball_spin = int(shot.shot.data.ball_spin)

        shot_overlay_clips.extend(make_shot_overlay(shot_overlay_start, shot_overlay_duration,
                                            (swing_type,impact_position,swing_speed,ball_speed,ball_spin),
                                            panel_placement='right',
                                            leftie=leftie,
                                            imperial=imperial,
                                            video_resolution=sizeout))

    print(master_duration)


    # Overlay the text clip on the first video clip
    video = CompositeVideoClip(clips + shot_overlay_clips)

    #video = video.resize(newsize=sizeout)

    # Write the result to a file
    video.write_videofile(fileout,
                          fps=FPS,
                          codec='libx264',
                          preset='fast',
                          ffmpeg_params=['-crf','23'],
                          audio_codec='aac',
                          #audio_fps=48000,
                          #audio_bitrate='128k',
                          threads=0)
                          #write_logfile=True)

    img_file = fileout+".png"
    clips[0].save_frame(img_file, t='00:00:06')
    im = Image.open(img_file)
    orig_size = im.size
    ratio = orig_size[0]/orig_size[1]
    size = int(100*ratio), 100
    im.thumbnail(size)
    im.save(img_file, "PNG")

    for clip in clips:
        #clip.reader.close()
        #clip.close()
        del clip.audio
        del clip

    for clip in shot_overlay_clips:
        #clip.reader.close()
        del clip

    #video.reader.close()
    #video.close()
    del video.audio
    del video

    return


panel_thickness = 1. / 6.
tiles_size = {}
tiles_pos = {}
# dimensions in the panel for each element
tiles_size['vertical'] = {'racquet': (1., 1./3.),
                            'swing' : (1., 2./9.),
                            'ball' : (1., 2./9.),
                            'spin' : (1., 2./9.)}

tiles_size['horizontal'] = {'racquet': (1./5.,1.),
                              'swing' : (1./5.,1.),
                              'ball' : (1./5.,1.),
                              'spin' : (1./5.,1.)}

tiles_pos['vertical'] = {'racquet': (0., 0.),
                            'swing' : (0., 1./3.),
                            'ball' : (0., 5./9.),
                            'spin' : (0., 7./9.)}

tiles_pos['horizontal'] = {'racquet': (1./10., 0.),
                            'swing' : (3./10., 0.),
                            'ball' : (5./10., 0.),
                            'spin' : (7./10., 0.)}

def center_in_tile(tile_size, tile_pos, label_clip, data_clip=None):
    label_size = label_clip.size
    if data_clip is not None:
        data_size = data_clip.size
    else:
        data_size = (0,0)

    # Horizontal center:
    label_hpos = (tile_size[0]-label_size[0])/2
    data_hpos = (tile_size[0]-data_size[0])/2

    # Vertical center (data is below label):
    if data_clip is not None:
        top_bottom_space = int(.15*tile_size[1])
        inner_space = tile_size[1]- 2* top_bottom_space - label_size[1] - data_size[1]
        label_vpos = top_bottom_space
        data_vpos = top_bottom_space + label_size[1] + inner_space
        return (label_hpos+tile_pos[0], label_vpos+tile_pos[1]), (data_hpos+tile_pos[0], data_vpos+tile_pos[1])
    else:
        label_vpos = (tile_size[1]-label_size[1])/2
        return (label_hpos+tile_pos[0], label_vpos+tile_pos[1])

def make_shot_overlay(start, duration, shotdata,
                      panel_placement='side', leftie=False, imperial=False,
                      video_resolution=(1920,1080)):
    """
    panel_placement=
        'right': always on the right side
        'left': always on the left side
        'top': always at the top
        'bottom': always at the bottom
        'side': on the right side for a forehands, serves, and smashes, on the left side for backhands.
                vice-versa for lefties.
    """
    if imperial:
        swing_str = "Swing (mi/h)"
        ball_str = "Ball (mi/h)"
    else:
        swing_str = "Swing (km/h)"
        ball_str = "Ball (km/h)"
    spin_str = "Spin"
    label_font = 'DejaVu-Sans-Bold'
    default_text_color = 'white'
    text_color_low = 'YellowGreen'
    text_color_mid = 'White'
    text_color_midplus = 'Orange'
    text_color_high = 'OrangeRed'
    stroke_color = 'black'
    data_font = 'DejaVu-Sans-Bold'

    hres = video_resolution[0]
    vres = video_resolution[1]
    video_ratio = float(hres)/float(vres)

    font_mult = float(video_resolution[0])/1920
    label_font_size = int(40*font_mult)
    data_font_size = int(90*font_mult)

    swing_type, impact_position, swing_speed, ball_speed, ball_spin = shotdata

    panel_type = "vertical" if panel_placement in ['right', 'left', 'side'] else "horizontal"
    if panel_type == "vertical":
        panel_is_v = True
    else:
        panel_is_v = False

    panel_is_h = not panel_is_v


    img_suffix = ''
    panel_start = 0.
    if panel_placement=='right':
        panel_start = 1. - panel_thickness
    elif panel_placement=='bottom':
        panel_start = 1. - panel_thickness*video_ratio

    if swing_type in ['FH','FS','FV']:
        if leftie:
            img_suffix = '_45'
        else:
            img_suffix = '_315'
            if panel_placement == 'side':
                panel_start = 1. - panel_thickness
    elif swing_type in ['BH','BS','BV']:
        if leftie:
            img_suffix = '_315'
            if panel_placement == 'side':
                panel_start = 1. - panel_thickness
        else:
            img_suffix = '_45'
    else:
        if not leftie and panel_placement == 'side':
            panel_start = 1. - panel_thickness

    # actual pixels where the panel is
    if panel_is_v:
        panel_position = (int(panel_start*hres), 0)
        panel_size = (int(panel_thickness*hres), vres)
    elif panel_is_h:
        panel_position = (0, int(panel_start*vres))
        panel_size = (hres, int(panel_thickness*hres))

    data0_str = str(swing_speed)
    data1_str = str(ball_speed)
    data2_str = "+"+str(ball_spin) if ball_spin > 0 else str(ball_spin)


    # The background
    bg = ColorClip(size=panel_size, col=(100,100,100,100)).set_start(start).set_duration(duration)
    bg = bg.set_position(panel_position)

    # The racquet and ball picture
    tile_ = 'racquet'
    tile_size = (tiles_size[panel_type][tile_][0]*panel_size[0],
                 tiles_size[panel_type][tile_][1]*panel_size[1])
    tile_pos = (tiles_pos[panel_type][tile_][0]*panel_size[0]+panel_position[0],
                 tiles_pos[panel_type][tile_][1]*panel_size[1]+panel_position[1])
    racquet_image = './video/graphics/racquet'+img_suffix+'.png'
    ball_image = './video/graphics/balls'+img_suffix+'/'+str(impact_position)+'.png'
    ball = ImageClip(ball_image).set_start(start).set_duration(duration)
    racq = ImageClip(racquet_image).set_start(start).set_duration(duration)
    if abs(font_mult - 1.) > 1.0e-5 :
        ball = ball.resize(newsize=font_mult)
        racq = racq.resize(newsize=font_mult)
    racq_pos = center_in_tile(tile_size, tile_pos, racq)
    racq = racq.set_position(racq_pos)
    ball = ball.set_position(racq_pos)

    # The Swing speed
    tile_ = 'swing'
    tile_size = (tiles_size[panel_type][tile_][0]*panel_size[0],
                 tiles_size[panel_type][tile_][1]*panel_size[1])
    tile_pos = (tiles_pos[panel_type][tile_][0]*panel_size[0]+panel_position[0],
                 tiles_pos[panel_type][tile_][1]*panel_size[1]+panel_position[1])
    swing_txt = TextClip(swing_str,fontsize=label_font_size,
                        color=default_text_color,font=label_font
                       ).set_start(start).set_duration(duration)
    text_color = speed2color(swing_speed, imperial)
    swingdata_txt = TextClip(data0_str,fontsize=data_font_size,
                    color=text_color,font=data_font
                   ).set_start(start).set_duration(duration)
    lab_pos, dat_pos = center_in_tile(tile_size,tile_pos,swing_txt,swingdata_txt)
    swing_txt = swing_txt.set_position(lab_pos)
    swingdata_txt = swingdata_txt.set_position(dat_pos)

    # The Swing speed
    tile_ = 'ball'
    tile_size = (tiles_size[panel_type][tile_][0]*panel_size[0],
                 tiles_size[panel_type][tile_][1]*panel_size[1])
    tile_pos = (tiles_pos[panel_type][tile_][0]*panel_size[0]+panel_position[0],
                 tiles_pos[panel_type][tile_][1]*panel_size[1]+panel_position[1])
    ball_txt = TextClip(ball_str,fontsize=label_font_size,
                        color=default_text_color,font=label_font
                       ).set_start(start).set_duration(duration)
    text_color = speed2color(ball_speed, imperial)
    balldata_txt = TextClip(data1_str,fontsize=data_font_size,
                    color=text_color,font=data_font
                   ).set_start(start).set_duration(duration)
    lab_pos, dat_pos = center_in_tile(tile_size,tile_pos,ball_txt,balldata_txt)
    ball_txt = ball_txt.set_position(lab_pos)
    balldata_txt = balldata_txt.set_position(dat_pos)

    # The Spin
    tile_ = 'spin'
    tile_size = (tiles_size[panel_type][tile_][0]*panel_size[0],
                 tiles_size[panel_type][tile_][1]*panel_size[1])
    tile_pos = (tiles_pos[panel_type][tile_][0]*panel_size[0]+panel_position[0],
                 tiles_pos[panel_type][tile_][1]*panel_size[1]+panel_position[1])
    spin_txt = TextClip(spin_str,fontsize=label_font_size,
                        color=default_text_color,font=label_font
                       ).set_start(start).set_duration(duration)
    text_color = spin2color(ball_spin)
    spindata_txt = TextClip(data2_str,fontsize=data_font_size,
                    color=text_color,font=data_font
                   ).set_start(start).set_duration(duration)
    lab_pos, dat_pos = center_in_tile(tile_size,tile_pos,spin_txt,spindata_txt)
    spin_txt = spin_txt.set_position(lab_pos)
    spindata_txt = spindata_txt.set_position(dat_pos)

    return [bg,racq,ball,swing_txt,swingdata_txt,ball_txt,balldata_txt,spin_txt,spindata_txt]


def speed2color(speed, imperial):
    text_color_low = 'YellowGreen'
    text_color_mid = 'White'
    text_color_midplus = 'Orange'
    text_color_high = 'OrangeRed'
    if imperial:
        if (speed <= 40):
            text_color = text_color_low
        elif (speed <= 55):
            text_color = text_color_mid
        elif (speed <= 65):
            text_color = text_color_midplus
        else:
            text_color = text_color_high
    else:
        if (speed <= 65):
            text_color = text_color_low
        elif (speed <= 90):
            text_color = text_color_mid
        elif (speed <= 105):
            text_color = text_color_midplus
        else:
            text_color = text_color_high
    return text_color

def spin2color(spin):
    text_color_low = 'YellowGreen'
    text_color_mid = 'White'
    text_color_midplus = 'Orange'
    text_color_high = 'OrangeRed'
    if (abs(spin) <= 2):
        text_color = text_color_low
    elif (abs(spin) <= 4):
        text_color = text_color_mid
    elif (abs(spin) <= 6):
        text_color = text_color_midplus
    else:
        text_color = text_color_high
    return text_color
