
class SonyShotFilter(object):

    def __init__(user, labels=None, date_range=[None,None], swing_speed=[None,None],
                 ball_speed=[None, None], ball_spin=[None,None]):
        self.user = User.objects.get(username=user)
        self.date_range = [None,None]
        self.swing_speed = [None,None]
        self.ball_speed = [None,None]
        self.ball_speed = [None,None]
