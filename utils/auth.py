import facebook
from models import User

def get_user(db, request, request_data=None):
    """Find the logged in user, if there is one.
    Use request cookies to find the user in the database.
    If the user is in the cookies but not in the database, add them.
    Very much facebook-centric at the moment
    """
    # check for a facebook valid signed request
    fb_d, err = facebook.get_data_from_request(request)
    if err:
        return {}, err

    facebook_id = fb_d.get('user_id')
    user = User.find_by_facebook_id(db, facebook_id)
    if user:
        return user, None

    # the user isn't already in the database, so we'll add them
    request_data = request_data or {}
    access_token = request_data.get('facebook_access_token')
    if not access_token:
        return {},  "no access token in request"

    profile = facebook.get_profile_for_access_token(access_token)
    if not profile:
        return {}, "couldn't get profile for access token"

    new_id = User.create_by_facebook_id(db, facebook_id, profile)
    profile['id'] = new_id
    return profile, None

