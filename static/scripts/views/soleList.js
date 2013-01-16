var app = app || {};
app.views = app.views || {};

app.views.SoleListView = Backbone.View.extend({
    el: '#results',
    initialize: function() {
        this.create = this.$('create_button');
    },
});
