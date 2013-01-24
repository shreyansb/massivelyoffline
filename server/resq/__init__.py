import re
import settings
import sys

from pyres import ResQ

_REDIS = "%s:%s" % (settings.REDIS_HOST, settings.REDIS_PORT)
resq = ResQ(_REDIS)

Q_EMAIL = "email"
Q_FACEBOOK = "facebook"

def get_queue_names():
    this = sys.modules[__name__]
    raw = [getattr(this, q) 
           for q in dir(this) 
           if re.match('^Q_*', q)]
    return sorted(set(raw))
