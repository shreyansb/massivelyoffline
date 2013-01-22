var app = app || {};
app.views = app.views || {};

app.views.SoleView = Backbone.View.extend({
    tagName: 'div', 
    className: 'result',
    events: {
        'click .join_sole': 'confirm',
        'click .leave_sole': 'confirm',
        'click .button_yes': 'checkLoginAndAct',
        'click .button_no': 'cancel'
    },

    initialize: function() {
        console.log("SoleView:initialize");
        _.bindAll(this);
        this.action = undefined;
    },

    render: function() {
        var t = $('script#results_row').html();
        var d = this.model.toJSON();
        var fd = this.format(d);
        
        // render the html of the template
        this.$el.html(Mustache.render(t, fd));

        // modify the html
        if (fd.user_is_student) {
            this.$('.join_sole').hide();
        } else {
            this.$('.leave_sole').hide();
        }
        return this;
    },

    format: function(d) {
        d['day'] = app.utils.format_date(d['day']);
        if (app.models.user.get('facebook_id')) {
            for (var j=0; j<d['students'].length; j++) {
                if (d['students'][j]['facebook_id'] == app.models.user.get('facebook_id')) {
                    d['user_is_student'] = true;
                }
            }
        } else {
            d['user_is_student'] = false;
        }
        return d;
    },

    confirm: function(e) {
        // hack?
        if ($(e.currentTarget).hasClass('join_sole')) {
            this.action = 'join';
        } else {
            this.action = 'leave';
        }
        var t = $('script#results_overlay').html();
        this.$el.append(t);
    },

    checkLoginAndAct: function(e) {
        console.log("SoleView:act", e);
        // check to see if the user is logged in
        var that = this;
        // is this in the model entirely?
        app.models.user.getUser(that.act, that.loginError)
    },

    loginError: function() {
        console.log("SoleView:loginError");
    },

    act: function() {
        console.log("SoleView:act");
        var sids = this.model.get('student_ids');
        if (this.action == 'join') {
            sids.push(app.models.user.get('id'));
        } else if (this.action == 'leave') {
            sids = _.without(sids, app.models.user.get('id'));
        }
        var that = this;
        console.log("SoleView:act:sids:", sids);
        this.model.save({'student_ids': sids}, {
            patch: true,
            success: that.actSuccess,
            error: that.actError
        });
    },

    fail: function() {

    },

    actSuccess: function(m, r, o) {
        console.log("SoleView:actSuccess");
        if (m.get('num_students') === 0) {
            // re-render the whole solelist
            app.collections.soles.remove(m);
            this.trigger("clearSole");
        } else {
            // re-render this specific sole
            this.$('.result_overlay').remove();
            this.action = undefined;
            this.render();
        }
    },

    actError: function(m, x, o) {
        console.log("SoleView:actError");
        this.$('.result_overlay').remove();
    },

    cancel: function(e) {
        this.$('.result_overlay').remove();
    }
});
