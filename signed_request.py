# http://sullerton.com/2011/10/checking-facebooks-signed_request-in-python/

import hmac
import hashlib
import base64
import ujson as json

def validate_signed_request(key, req):
    """Checks that the signed_request is valid by
    generating a signature from the key and data, and comparing
    it to the signature in the signed_request

    Returns a pair: data, error
    If there is an error string, data will be None.
    If there is a data object, error will be None
    """
    l = req.split('.', 2)
    encoded_sig = str(l[0])
    payload = str(l[1])

    sig = base64.urlsafe_b64decode(encoded_sig + "=" * ((4 - len(encoded_sig) % 4) % 4))
    data = base64.urlsafe_b64decode(payload + "=" * ((4 - len(payload) % 4) % 4))

    expected_sig = hmac.new(key, 
                            msg=payload, 
                            digestmod=hashlib.sha256).digest()

    if expected_sig != sig:
        return None, "signature mismatch"
    else:
        return json.loads(data), None
