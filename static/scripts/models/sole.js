var app = app || {};
app.models = app.models || {};
app.collections = app.collections || {};

app.models.Sole = Backbone.Model.extend({
});

app.collections.SoleCollection = Backbone.Collection.extend({
    model: app.models.Sole,
    url: function() {
        if (this.course_id) {
            return '/course/' + this.course_id + '/sole';
        } else {
            return '/sole';
        }
    },
    initialize: function(models, options) {
        _.bindAll(this, "url");
        if (options) {
            this.course_id = options.course_id;
        } else {
            this.course_id = undefined;
        }
    },
});
