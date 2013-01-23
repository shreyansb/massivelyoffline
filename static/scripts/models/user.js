var app = app || {};
app.models = app.models || {};

app.models.User = Backbone.Model.extend({
    urlRoot: "/user",

    initialize: function() {
        _.bindAll(this);
    },

    getUser: function(success, error, params) {
        // callback approach, and it's not ideal
        // another way would be to actually return the user in this call
        // via a deferred that walked through the facebook and database steps
        if (this.isValid()) {
            success(params);
        } else {
            this.success = success;
            this.error = error;
            this.params = params;
            var that = this;
            app.facebook.loginStatus(that.facebookSuccess, that.facebookError);
        }
    },

    isValid: function() {
        // a user is valid if they have an id and facebook_id
        if (this.get('id') && this.get('facebook_id')) {
            return true;
        }
        return false;
    },

    facebookSuccess: function(resp) {
        console.log(resp);
        this.authResponse = resp.authResponse;
        var that = this;
        app.facebook.getUser(that.facebookUserSuccess, that.facebookError);
    },

    facebookUserSuccess: function(user) {
        user['access_token'] = this.authResponse.accessToken;
        user['signed_request'] = this.authResponse.signedRequest;
        user['facebook_id'] = user['id'];
        delete user['id'];
        this.saveUser(user);
    },

    facebookError: function(resp) {
        this.error(this.params);
    },

    saveUser: function(user) {
        this.save(user, {
            success: this.saveSuccess,
            error: this.saveError,
            wait: true
        });
    },

    saveSuccess: function(m, r, o) {
        this.success(this.params);
    },

    saveError: function(m, x, o) {
        this.error(this.params);
    }
});
