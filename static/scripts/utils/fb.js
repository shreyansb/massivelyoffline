var app = app || {};
app.fb = app.fb || {};
app.fb.resp = undefined;

app.fb.loginStatus = function(success, error, params) {
    console.log("fb:loginStatus");
    FB.getLoginStatus(function(resp) {
        if (resp.status === "connected") {
            app.fb.resp = resp;
            success(resp, params);
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
    console.log("fb:login");
    FB.login(function(resp) {
        if (resp.authResponse) {
            app.fb.resp = resp;
            app.fb.getUser();
            success(resp, params);
        } else {
            app.fb.resp = undefined;
            error(resp, params);
            return false;
        }
    }, {scope: 'email'});
};

app.fb.getUser = function() {
    console.log("fb:getUser");
    FB.api('/me', function(resp) {
        app.models.user.setFacebookUser(resp);
    });
};
