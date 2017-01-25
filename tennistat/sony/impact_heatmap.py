import numpy as np
import matplotlib.cm as cm
import matplotlib.colors as clrs
import matplotlib
import PIL
import io
import base64

def make_heatmap(occurrences, rotation=None):
    if rotation == 90:
        rot = PIL.Image.ROTATE_90
    elif rotation == 270:
        rot = PIL.Image.ROTATE_270
    else:
        rot = PIL.Image.ROTATE_90
    #occurrences[:] = 0
    #occurrences[0] = 1
    #occurrences[1] = 1
    #occurrences[13] = 1
    arr = _impact_heatmap(occurrences)
    img_arr = matplotlib.cm.rainbow(arr,bytes=True,)
    cutoff = 0.07
    mask = arr < cutoff
    img_arr[mask,3] = arr[mask]/cutoff*255
    #img_arr[arr<0.01] = [0,0,0,0]
    #img = PIL.Image.fromarray(np.transpose(img_arr))
    img = PIL.Image.fromarray(np.transpose(img_arr[:,::-1], (1, 0, 2)))
    ##
    # Hardcoded resolutions:
    # heatmap: 141x171
    # racquet: 150x190
    # offse: 4,4(16)
    ##
    tmp = io.BytesIO()
    #racq_img = PIL.Image.open('/home/alessandro/Documents/tennis-sensor-web/shot/racquet_small.png')
    racq_img = PIL.Image.open('./generic/img/racquet_small.png')
    racq_img.paste(img,box=(4,3),mask=img)
    racq_img.transpose(rot).save(fp=tmp, format='png')
    #tmp = io.BytesIO()
    #img.save(fp=tmp, format='png')
    return base64.b64encode(tmp.getvalue())

def _ball_inprint(radius):
    mesh = np.zeros((radius*2,radius*2))
    center = radius - 0.5
    flat = 0.5
    for i in range(radius*2):
        for j in range(radius*2):
            r = np.sqrt((i-center)**2+(j-center)**2)/radius
            mesh[i,j] = max(0,1 - r)
    return mesh/np.max(mesh)

def _ball_inprint2(radius):
    mesh = np.zeros((radius*2,radius*2))
    center = radius - 0.5
    sigma = radius/2.4
    flat = 0.5
    for i in range(radius*2):
        for j in range(radius*2):
            r = abs(np.sqrt((i-center)**2+(j-center)**2))
            mesh[i,j] = np.exp(-(r/sigma)**2)
    return mesh/np.max(mesh)

def _impact_heatmap(occurrences):
    nshots = np.sum(occurrences)
    impact_size = [1000,1200]
    racquet_res = np.array([143,171],dtype=int)
    #racquet_res = np.array([300,250],dtype=int)
    padding = 1.5
    mesh_res = (racquet_res*padding).astype(int)
    ball_radius = int(racquet_res[0]/3.7)

    ball_mesh = _ball_inprint2(ball_radius)
    offset = (mesh_res - racquet_res)//2

    mesh = np.zeros(mesh_res)
    origin = np.zeros(2,dtype=int)
    for pos, occurrence in enumerate(occurrences):
        origin[0] = int(offset[0]+_impact2coord[pos][0]/impact_size[0]*racquet_res[0]-ball_radius)
        origin[1] = int(offset[1]+_impact2coord[pos][1]/impact_size[1]*racquet_res[1]-ball_radius)
        mesh[origin[0]:origin[0]+2*ball_radius,origin[1]:origin[1]+2*ball_radius] += ball_mesh*occurrence
    mesh = mesh[offset[0]:offset[0]+racquet_res[0], offset[1]:offset[1]+racquet_res[1]]
    return mesh/np.max(mesh)

_impact2coord= {0:[200,375],
                1:[150,525],
                2:[150,675],
                3:[200,825],
                4:[300,225],
                5:[350,375],
                6:[325,525],
                7:[325,675],
                8:[350,825],
                9:[300,975],
                10:[500,175],
                11:[500,350],
                12:[500,525],
                13:[500,675],
                14:[500,850],
                15:[500,1025],
                16:[700,225],
                17:[650,375],
                18:[675,525],
                19:[675,675],
                20:[650,825],
                21:[700,975],
                22:[800,375],
                23:[850,525],
                24:[850,675],
                25:[800,825]}
