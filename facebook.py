import requests
import settings
import signed_request
import urlparse

def get_facebook_data_from_cookie(request):
    """looks for a facebook cookie containing a signed_request,
    validates the signed_request, and returns the contents.
    Returns None in case of error
    """
    c_name = "fbsr_%s" % settings.FACEBOOK_APP_ID
    c = request.cookies.get(c_name)
    if not c:
        return None

    d, err = signed_request.validate_facebook_signed_request(c)
    if err:
        return None
    else:
        return d

def extend_access_token(old):
    """takes any access token (short- or long-lived) and 
    exchanges it for a long-lived access token. 
    Returns None in case of error.
    """
    url = get_extend_access_token_url(old)
    r = requests.get(url)
    if r.status == 200:
        components = urlparse.parse_qs(r.content)
        return components.get('access_token')[0]
    else:
        return None

def get_extend_access_token_url(old):
    """generates the URL to exchange access tokens.
    Returns the URL string
    """
    url = ("https://graph.facebook.com/oauth/access_token?"
           "grant_type=fb_exchange_token"
           "&client_id=%s"
           "&client_secret=%s"
           "&fb_exchange_token=%s") % (
               settings.FACEBOOK_APP_ID,
               settings.FACEBOOK_APP_SECRET,
               old)
    return url

def validate_signed_request(req):
    return validate_signed_request(settings.FACEBOOK_APP_SECRET, req)
