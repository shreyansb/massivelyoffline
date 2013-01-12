sole.fb = sole.fb || {};
sole.fb.id = undefined;
sole.fb.resp = undefined;

sole.fb.login = function(success, error, params) {
    console.log("fb: login");
    FB.login(function(resp) {
        if (resp.authResponse) {
            sole.fb.resp = resp;
            sole.fb.get_user();
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
    console.log("fb: get_user");
    FB.api('/me', function(resp) {
        window.facebook_user = resp;
        if (resp.id) {
            window.facebook_id = resp.id;
        }
    });
};

sole.fb.image_url_from_id = function(facebook_id) {
    return "http://graph.facebook.com/" + facebook_id + "/picture?width=50&height=50";
};
