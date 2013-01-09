sole.fb = sole.fb || {};
sole.fb.user = undefined;
sole.fb.resp = undefined;

sole.fb.login = function() {
    FB.login(function(resp) {
        if (resp.authResponse) {
            sole.fb.resp = resp;
        } else {
            sole.fb.resp = undefined;
            return false;
        }
    });
};

sole.fb.login_status = function() {
    FB.getLoginStatus(function(resp) {
        if (resp.status === "connected") {
            sole.fb.resp = resp;
        } else if (resp.status === "not_authorized") {
            sole.fb.resp = undefined;
            sole.fb.login(); 
        } else {
            sole.fb.resp = undefined;
            sole.fb.login(); 
        }
    });
};

sole.fb.get_user = function() {
    FB.api('/me', function(resp) {
        sole.fb.user = resp;
    });
}
