import requests
import logging
import settings
import urlparse
import ujson as json
from utils import signed_request

def get_data_from_request(request):
    """looks for a facebook cookie containing a signed_request,
    validates the signed_request, and returns the contents.
    Returns None in case of error
    """
    sr_name = "fbsr_%s" % settings.FACEBOOK_APP_ID
    sr = request.cookies.get(sr_name)
    if not sr:
        return {}, "no facebook signed_request in request"
    return get_data_from_signed_request(sr)

def get_data_from_signed_request(sr):
    d, err = validate_signed_request(sr)
    if err:
        return {}, "invalid facebook signed_request"
    else:
        return d, None

def validate_signed_request(req):
    return signed_request.validate_signed_request(settings.FACEBOOK_APP_SECRET, req)

###
### Facebook API actions
###

def extend_access_token(old):
    """takes any access token (short- or long-lived) and 
    exchanges it for a long-lived access token. 
    Returns None in case of error.
    """
    url = get_extend_access_token_url(old)
    r = requests.get(url)
    if r.status_code == 200:
        components = urlparse.parse_qs(r.content)
        return components.get('access_token')[0]
    else:
        logging.error("couldn't extend access token")
        logging.error(r.content)
        return None

def exchange_code_for_access_token(code):
    url = get_code_exchange_url(code)
    r = requests.get(url)
    if r.status_code == 200:
        return json.loads(r.content)
    else: 
        logging.error("couldn't exchange code for access token")
        logging.error(r.content)
        return None

def get_profile_for_access_token(access_token):
    url = get_own_profile_url(access_token)
    r = requests.get(url)
    if r.status_code == 200:
        return json.loads(r.content)
    else:
        logging.error("couldn't get profile")
        logging.error(r.content)
        return None

###
### Facebook API endpoint urls
###

def get_code_exchange_url(code):
    """generate the url to exchange an oauth code for an access token
    """
    return ("https://graph.facebook.com/oauth/access_token?"
            "&client_id=%s"
            "&client_secret=%s"
            "&redirect_uri=%s"
            "&code=%s") % (
                settings.FACEBOOK_APP_ID,
                settings.FACEBOOK_APP_SECRET,
                settings.FACEBOOK_REDIRECT_URI,
                code)

def get_extend_access_token_url(old):
    """generates the URL to exchange access tokens.
    Returns the URL string
    """
    return ("https://graph.facebook.com/oauth/access_token?"
            "grant_type=fb_exchange_token"
            "&client_id=%s"
            "&client_secret=%s"
            "&fb_exchange_token=%s") % (
                settings.FACEBOOK_APP_ID,
                settings.FACEBOOK_APP_SECRET,
                old)

def get_own_profile_url(access_token):
    """generate the url to get a user's profile, using their own access token
    """
    return "https://graph.facebook.com/me?access_token=%s" % (access_token)
