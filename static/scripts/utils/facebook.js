var app = app || {};
app.facebook = app.facebook || {};

app.facebook.loginStatus = function(success, error, params) {
    FB.getLoginStatus(function(resp) {
        if (resp.status === "connected") {
            success(resp, params);
        } else if (resp.status === "not_authorized") {
            app.facebook.login(success, error, params); 
        } else {
            app.facebook.login(success, error, params); 
        }
    });
};

app.facebook.login = function(success, error, params) {
    FB.login(function(resp) {
        if (resp.authResponse) {
            app.facebook.resp = resp;
            success(resp, params);
        } else {
            error(resp, params);
            return false;
        }
    }, {scope: 'email'});
};

app.facebook.getUser = function(success, error) {
    console.log("fb:getUser");
    FB.api('/me', function(resp) {
        success(resp);
    });
};
