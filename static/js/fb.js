sole.fb = sole.fb || {};
sole.fb.user = undefined;
sole.fb.resp = undefined;

sole.fb.login = function(success, error) {
    FB.login(function(resp) {
        if (resp.authResponse) {
            sole.fb.resp = resp;
            success();
        } else {
            sole.fb.resp = undefined;
            error();
            return false;
        }
    });
};

sole.fb.login_status = function(success, error) {
    FB.getLoginStatus(function(resp) {
        if (resp.status === "connected") {
            sole.fb.resp = resp;
            success();
        } else if (resp.status === "not_authorized") {
            sole.fb.resp = undefined;
            sole.fb.login(success, error); 
        } else {
            sole.fb.resp = undefined;
            sole.fb.login(success, error); 
        }
    });
};

sole.fb.get_user = function() {
    FB.api('/me', function(resp) {
        sole.fb.user = resp;
    });
}

sole.fb.image_url_from_id = function(facebook_id) {
    var url = "http://graph.facebook.com/" + facebook_id + "/picture?width=50&height=50";
    console.log(url);
    return url;
};
