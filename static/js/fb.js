sole.fb = sole.fb || {};
sole.fb.user = undefined;
sole.fb.resp = undefined;

sole.fb.login = function(success, error, params) {
    console.log("fb: login");
    FB.login(function(resp) {
        if (resp.authResponse) {
            sole.fb.resp = resp;
            success(params);
        } else {
            sole.fb.resp = undefined;
            error(params);
            return false;
        }
    });
};

sole.fb.login_status = function(success, error, params) {
    console.log("fb: login_status");
    FB.getLoginStatus(function(resp) {
        if (resp.status === "connected") {
            sole.fb.resp = resp;
            success(params);
        } else if (resp.status === "not_authorized") {
            sole.fb.resp = undefined;
            sole.fb.login(success, error, params); 
        } else {
            sole.fb.resp = undefined;
            sole.fb.login(success, error, params); 
        }
    });
};

sole.fb.get_user = function() {
    FB.api('/me', function(resp) {
        sole.fb.user = resp;
    });
}

sole.fb.image_url_from_id = function(facebook_id) {
    return "http://graph.facebook.com/" + facebook_id + "/picture?width=50&height=50";
};
