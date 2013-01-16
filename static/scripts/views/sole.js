var app = app || {};
app.views = app.views || {};

app.views.SoleView = Backbone.View.extend({
    tagName: 'div', 
    className: 'result',
    events: {
        'click .join_sole': 'confirm',
        'click .leave_sole': 'confirm',
        'click .button_yes': 'act',
        'click .button_no': 'cancel'
    },

    initialize: function() {
        console.log("SoleView:initialize");
        _.bindAll(this, "render", "confirm", "act", "cancel", "format");
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
        if (window.sole_facebook_id) {
            for (var j=0; j<d['students'].length; j++) {
                if (d['students'][j]['facebook_id'] == window.sole_facebook_id) {
                    d['user_is_student'] = true;
                }
            }
        } else {
            d['user_is_student'] = false;
        }
        return d;
    },

    confirm: function(e) {
        console.log("SoleView: confirm", e);
    },

    act: function(e) {
        console.log("SoleView: act", e);
    },

    cancel: function(e) {
        console.log("SoleView: cancel", e);
    }
});
