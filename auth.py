import facebook
from models import User

def get_user(db, request):
    """Find the logged in user, if there is one
    """
    # check for a facebook valid signed request
    fb_d = facebook.get_data_from_cookie(request)
    if not fb_d:
        return None
    facebook_id = fb_d.get('user_id')
    user = User.find_by_facebook_id(db, facebook_id)
    return user
