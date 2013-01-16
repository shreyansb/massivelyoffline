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
    render: function() {
        var t = $('template#results_row').html();
        this.$el.html(Mustache.render(t, this.model.toJSON()));
        return this;
    },
    confirm: function(e) {
        console.log("SoleView: confirm");
    },
    act: function(e) {
        console.log("SoleView: act");

    },
    cancel: function(e) {
        console.log("SoleView: cancel");

    }
});
