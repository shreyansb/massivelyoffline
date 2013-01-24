import facebook
from models import User

def get_user_from_request(db, request):
    """Find the logged in user, if there is one.
    Use request cookies to find the user in the database.
    """
    # check for a facebook valid signed request
    fb_d, err = facebook.get_data_from_request(request)
    if err:
        return {}, err

    facebook_id = fb_d.get('user_id')
    user = User.find_by_facebook_id(db, facebook_id)
    if user:
        return user, None

    return {}, "no user information in request cookies"
