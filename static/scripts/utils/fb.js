var app = app || {};
app.fb = app.fb || {};
app.fb.resp = undefined;

app.fb.loginStatus = function(success, error, params) {
    FB.getLoginStatus(function(resp) {
        if (resp.status === "connected") {
            app.fb.resp = resp;
            success(params);
        } else if (resp.status === "not_authorized") {
            app.fb.resp = undefined;
            app.fb.login(success, error, params); 
        } else {
            app.fb.resp = undefined;
            app.fb.login(success, error, params); 
        }
    });
};

app.fb.login = function(success, error, params) {
    FB.login(function(resp) {
        if (resp.authResponse) {
            app.fb.resp = resp;
            app.fb.get_user();
            success(params);
        } else {
            app.fb.resp = undefined;
            error(params);
            return false;
        }
    });
};

app.fb.get_user = function() {
    FB.api('/me', function(resp) {
        window.app_facebook_user = resp;
        if (resp.id) {
            window.app_facebook_id = resp.id;
        }
    });
};
