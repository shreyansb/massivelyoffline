import facebook
from models import User

def get_user(db, request):
    """Find the logged in user, if there is one.
    Use request cookies to find the user in the database.
    If the user is in the cookies but not in the database, add them.
    Very much facebook-centric at the moment
    """
    # check for a facebook valid signed request
    fb_d = facebook.get_data_from_cookie(request)
    if not fb_d:
        return None
    facebook_id = fb_d.get('user_id')
    user = User.find_by_facebook_id(db, facebook_id)
    if user:
        return user

    # the user isn't already in the database, so we'll add them
    access_token = request.form.get('facebook_access_token')
    if not access_token:
        return None
    profile = facebook.get_profile_for_access_token(access_token)
    if not profile:
        return None
    new_id = User.create_by_facebook_id(db, facebook_id, profile)
    profile['id'] = new_id
    return profile

