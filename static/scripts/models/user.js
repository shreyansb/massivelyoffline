var app = app || {};
app.models = app.models || {};

app.models.User = Backbone.Model.extend({
    initialize: function() {
        console.log("User:initialize");
        _.bindAll(this);
    },

    getUser: function(success, error, params) {
        console.log("User:getUser");
        // get the facebook response
        // get the user from the database
        this.success = success;
        this.error = error;
        this.params = params;
        var that = this;
        app.fb.loginStatus(that.loginSuccess, that.loginError);
    },

    loginSuccess: function() {
        console.log("User:loginSuccess");
        this.success(this.params);
    },

    loginError: function() {
        console.log("User:loginError");
        this.error(this.params);
    },

    setFacebookUser: function(resp) {
        console.log("User:setFacebookUser");
        this.set('facebook_user', resp);
        if (resp.id) {
            this.set('facebook_id', resp.id);
        }
    }
});
